import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Search, CheckSquare, Trash2 } from 'lucide-react';
import api from '@/lib/axios';

interface Task {
  id: number;
  title: string;
  description: string;
  isFinished: boolean;
  assignedUserId?: number;
  assignedUserName?: string;
  projectId?: number;
}

interface Project {
  id: number;
  name: string;
}

interface User {
  id: number;
  userName: string;
}

const Tasks = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'todo' | 'completed'>('all');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedUserId: '', projectId: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await fetchProjectsAndUsers();
      await fetchTasks();
    };
    loadData();
  }, []);

  const fetchProjectsAndUsers = async () => {
    try {
      // Employees: get only their projects; Admins: get all
      const projectEndpoint = user?.role === 'Administrator' ? '/api/Project' : '/api/Project/GetProjectsForUser';
      const projectsRes = await api.get(projectEndpoint);
      setProjects(projectsRes.data);
      // Get all users for assignment dropdown
      const usersRes = await api.get('/api/User');
      setUsers(usersRes.data);
    } catch {
      setProjects([]);
      setUsers([]);
    }
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      // Employees: get only tasks for their projects; Admins: get all
      let response;
      if (user?.role === 'Administrator') {
        response = await api.get('/api/Task');
      } else {
        // Get all tasks for each project the employee is part of
        const allTasks: Task[] = [];
        for (const project of projects) {
          const res = await api.get(`/api/Project/${project.id}/tasks`);
          allTasks.push(...res.data);
        }
        setTasks(allTasks);
        setIsLoading(false);
        return;
      }
      setTasks(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load tasks',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTask = async (taskId: number, currentStatus: boolean, assignedUserId?: number) => {
    // Only allow admins or employees assigned to the task
    if (!isAdmin && Number(user?.id) !== assignedUserId) return;
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      await api.put(`/api/Task/${taskId}`, {
        ...task,
        isFinished: !currentStatus,
      });

      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, isFinished: !currentStatus } : t
      ));

      toast({
        title: 'Success',
        description: `Task marked as ${!currentStatus ? 'completed' : 'incomplete'}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      });
    }
  };

  const isAdmin = user?.role === 'Administrator';
  const isEmployee = user?.role === 'Employee';

  const handleDeleteTask = async (taskId: number) => {
    try {
      await api.delete(`/api/Task/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
      toast({
        title: 'Success',
        description: 'Task deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      });
    }
  };

  const handleCreateTask = async () => {
    setIsSaving(true);
    try {
      const response = await api.post(`/api/Task`, {
        id: 0,
        title: newTask.title,
        description: newTask.description,
        isFinished: false
      }, {
        params: {
          projectId: Number(newTask.projectId),
          userId: newTask.assignedUserId ? Number(newTask.assignedUserId) : Number(user?.id)
        }
      });
      setShowTaskForm(false);
      setNewTask({ title: '', description: '', assignedUserId: '', projectId: '' });
      fetchTasks();
      toast({ title: 'Success', description: 'Task created successfully' });
    } catch {
      toast({ title: 'Error', description: 'Failed to create task', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // Employees: only see tasks for their projects
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    // Employees: only see tasks for their projects
    if (isEmployee && !projects.some(p => p.id === task.projectId)) return false;
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'completed') return matchesSearch && task.isFinished;
    return matchesSearch && !task.isFinished;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.isFinished).length,
    pending: tasks.filter(t => !t.isFinished).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-2">Manage your work items</p>
        </div>
        {(isAdmin || (isEmployee && projects.length > 0)) && (
          <Button onClick={() => setShowTaskForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        )}
      </div>

      {/* Task creation form */}
      {showTaskForm && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">New Task</h3>
            <div className="grid gap-2 mb-2">
              <input
                type="text"
                placeholder="Title"
                value={newTask.title}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                className="border rounded px-2 py-1"
              />
              <input
                type="text"
                placeholder="Description"
                value={newTask.description}
                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                className="border rounded px-2 py-1"
              />
              <select
                value={newTask.projectId}
                onChange={e => setNewTask({ ...newTask, projectId: e.target.value })}
                className="border rounded px-2 py-1"
              >
                <option value="">Select Project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <select
                value={newTask.assignedUserId}
                onChange={e => setNewTask({ ...newTask, assignedUserId: e.target.value })}
                className="border rounded px-2 py-1"
              >
                <option value="">Assign to...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.userName}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateTask} disabled={isSaving || !newTask.title || !newTask.projectId}>
                {isSaving ? 'Creating...' : 'Create'}
              </Button>
              <Button variant="outline" onClick={() => setShowTaskForm(false)} disabled={isSaving}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Total Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            All
          </Button>
          <Button
            variant={filterStatus === 'todo' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('todo')}
          >
            To Do
          </Button>
          <Button
            variant={filterStatus === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('completed')}
          >
            Completed
          </Button>
        </div>
      </div>

      {/* Tasks list */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CheckSquare className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No tasks found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery ? 'Try adjusting your search' : 'Create your first task to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={task.isFinished}
                    onCheckedChange={() => handleToggleTask(task.id, task.isFinished, task.assignedUserId)}
                    className="mt-1"
                    disabled={!isAdmin && Number(user?.id) !== task.assignedUserId}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-medium ${task.isFinished ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </h3>
                      <Badge variant={task.isFinished ? 'secondary' : 'default'}>
                        {task.isFinished ? 'Completed' : 'Pending'}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {task.description}
                        {task.assignedUserName && (
                          <span className="ml-2 text-xs text-primary font-semibold">(Assigned to: {task.assignedUserName})</span>
                        )}
                      </p>
                    )}
                  </div>
                  {isAdmin && (
                    <Button variant="outline" size="sm" onClick={() => handleDeleteTask(task.id)} className="ml-2 text-destructive">
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  )}
                  {isEmployee && Number(user?.id) === task.assignedUserId && (
                    <Button variant="outline" size="sm" className="ml-2" onClick={() => {/* navigate to edit page if needed */}}>
                      Edit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;
