import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

type Activity = {
  id: string;
  message: string;
  actor?: string;
  createdAt: string;
};

const ActivityFeed = ({ limit = 6 }: { limit?: number }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        // Try to fetch recent activities from the API. If your backend exposes another route,
        // update this path accordingly.
        const res = await api.get('/api/Activity');

        // Accept responses that are either an array or an object with an `activities` array.
        const data = Array.isArray(res.data) ? res.data : res.data?.activities;

        if (Array.isArray(data)) {
          const mapped = data.slice(0, limit).map((a: unknown) => {
            const item = a as Record<string, unknown>;
            const id = (item.id ?? item.activityId)?.toString?.() || Math.random().toString();
            const message = (item.message as string) || (item.description as string) || (item.action as string) || JSON.stringify(item);
            const actor = (item.actor as string) || (item.userName as string) || (item.user as string) || undefined;
            const createdAt = (item.createdAt as string) || (item.timestamp as string) || (item.date as string) || new Date().toISOString();
            return { id, message, actor, createdAt } as Activity;
          });
          setActivities(mapped);
          return;
        }

        throw new Error('Unexpected activity response');
      } catch (err) {
        // Fallback to mock activity items if the API is not available or returns unexpected data.
        const now = Date.now();
        const mock: Activity[] = [
          { id: 'm1', message: 'Project "Website Redesign" created', actor: 'Alice', createdAt: new Date(now - 1000 * 60 * 10).toISOString() },
          { id: 'm2', message: 'Task "Design hero section" completed', actor: 'Bob', createdAt: new Date(now - 1000 * 60 * 60).toISOString() },
          { id: 'm3', message: 'New user "charlie" added', actor: 'Admin', createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString() },
          { id: 'm4', message: 'Milestone "MVP" reached', actor: 'Diana', createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString() },
        ];
        setActivities(mock.slice(0, limit));
        toast({ title: 'Activity', description: 'Showing recent activity (mock data).', });
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [limit, toast]);

  if (isLoading) {
    return (
      <div className="py-6 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (activities.length === 0) {
    return <div className="text-center py-6 text-muted-foreground">No recent activity</div>;
  }

  return (
    <ul className="space-y-4">
      {activities.map((a) => (
        <li key={a.id} className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">{(a.actor || '?').charAt(0).toUpperCase()}</div>
          <div className="flex-1">
            <div className="text-sm text-foreground">{a.message}</div>
            <div className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}{a.actor ? ` • ${a.actor}` : ''}</div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ActivityFeed;
