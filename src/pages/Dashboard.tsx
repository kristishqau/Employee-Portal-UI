import React, { useEffect, useState, Suspense } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
const ActivityFeed = React.lazy(() => import('@/components/ActivityFeed'));
import { FolderKanban, CheckSquare, Users, TrendingUp, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';

type StatItem = {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
};

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const isAdmin = user?.role === 'Administrator';

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<StatItem[]>([]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setIsLoading(true);
      try {
        if (isAdmin) {
          const [usersRes, projectsRes, tasksRes] = await Promise.all([
            api.get('/api/User'),
            api.get('/api/Project'),
            api.get('/api/Task'),
          ]);

          const users = Array.isArray(usersRes.data) ? usersRes.data : [];
          const projects = Array.isArray(projectsRes.data) ? projectsRes.data : [];
          const tasks = (Array.isArray(tasksRes.data) ? tasksRes.data : []) as Array<{ isFinished?: boolean }>;
          const completedTasks = tasks.filter((t) => t.isFinished).length;
          const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

          setStats([
            { title: 'Total Users', value: users.length.toString(), icon: Users, color: 'text-blue-600' },
            { title: 'Active Projects', value: projects.length.toString(), icon: FolderKanban, color: 'text-green-600' },
            { title: 'Total Tasks', value: tasks.length.toString(), icon: CheckSquare, color: 'text-orange-600' },
            { title: 'Completion Rate', value: `${completionRate}%`, icon: TrendingUp, color: 'text-purple-600' },
          ]);
        } else {
          const [projectsRes, tasksRes] = await Promise.all([
            api.get('/api/Project/GetProjectsForUser'),
            api.get('/api/Task'),
          ]);

          const projects = Array.isArray(projectsRes.data) ? projectsRes.data : [];
          const tasks = (Array.isArray(tasksRes.data) ? tasksRes.data : []) as Array<{ isFinished?: boolean }>;
          const completedTasks = tasks.filter((t) => t.isFinished).length;
          const pendingTasks = tasks.length - completedTasks;

          setStats([
            { title: 'My Projects', value: projects.length.toString(), icon: FolderKanban, color: 'text-blue-600' },
            { title: 'My Tasks', value: tasks.length.toString(), icon: CheckSquare, color: 'text-green-600' },
            { title: 'Completed', value: completedTasks.toString(), icon: CheckSquare, color: 'text-orange-600' },
            { title: 'Pending', value: pendingTasks.toString(), icon: CheckSquare, color: 'text-purple-600' },
          ]);
        }
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to load dashboard data', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, [isAdmin, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.userName}!</h1>
        <p className="text-muted-foreground mt-2">
          {isAdmin ? "Here's an overview of your organization" : "Here's what's happening with your work"}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="py-6 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            }
          >
            <ActivityFeed />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
