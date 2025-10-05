import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';


interface Project {
  id: number;
  name: string;
  description: string;
}

interface User {
  id: number;
  userName: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  assignedUserId?: number;
  assignedUserName?: string;
}

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedUserId: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const { toast } = useToast();

  const isAdmin = user?.role === 'Administrator';
  const isEmployee = user?.role === 'Employee';
  // Employee is part of project if their id is in users list
  const isEmployeeInProject = isEmployee && users.some(u => u.id === Number(user?.id));

  useEffect(() => {
    if (!id) return;
    fetchProject();
    fetchTasks();
    // Fetch users for both admins and employees who are part of the project
    if (isAdmin || isEmployee) fetchUsers();
    // eslint-disable-next-line
  }, [id]);

  const fetchProject = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/Project/${id}`);
      setProject(response.data);
    } catch (err) {
      setError('Project not found or you do not have access.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/api/Project/${id}/tasks`);
      setTasks(response.data);
    } catch {
      setTasks([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get(`/api/User/projects/${id}/users`);
      setUsers(response.data);
    } catch {
      setUsers([]);
    }
  };

  const handleCreateTask = async () => {
    setIsSaving(true);
    
    let createdTask;
    try {
      const response = await api.post(`/api/Task`, {
        id: 0,
        title: newTask.title,
        description: newTask.description,
        isFinished: false
      }, {
        params: {
          projectId: Number(id),
          userId: Number(user?.id)  // Always use current user as creator
        }
      });
      createdTask = response.data;
    } catch (error) {
      const detail = error?.response?.data?.detail || 'Failed to create task';
      toast({ title: 'Error', description: detail, variant: 'destructive' });
      setIsSaving(false);
      return;
    }

    // Assign user to task if a different user is selected
    if (newTask.assignedUserId && Number(newTask.assignedUserId) !== Number(user?.id)) {
      try {
        await api.post(`/api/User/addUserToTaskAndProject`, null, {
          params: {
            userId: Number(newTask.assignedUserId),
            taskId: createdTask.id,
            projectId: Number(id)
          }
        });
      } catch (error) {
        const detail = error?.response?.data?.detail || 'Failed to assign user to task';
        toast({ title: 'Error', description: detail, variant: 'destructive' });
        setIsSaving(false);
        return;
      }
    }
    
    setShowTaskForm(false);
    setNewTask({ title: '', description: '', assignedUserId: '' });
    await fetchTasks();
    setIsSaving(false);
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await api.delete(`/api/Task/${taskId}`);
      fetchTasks();
    } catch {
      // handle error
    }
  };

  const handleDeleteProject = async () => {
    setIsDeletingProject(true);
    try {
      await api.delete(`/api/Project/${id}`);
      navigate('/projects');
    } catch (error) {
      if (error?.response?.status === 400 || error?.response?.status === 422) {
        toast({
          title: 'Cannot delete project',
          description: 'There are open tasks. Please close or remove all tasks before deleting the project.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Failed to delete project',
          description: 'An unexpected error occurred.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsDeletingProject(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <p className="text-lg font-medium text-destructive mb-2">{error || 'Project not found.'}</p>
          <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <p>{project.description || 'No description available.'}</p>
            <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
              Go Back
            </Button>
          </div>
          {(isAdmin || isEmployeeInProject) && (
            <div className="flex gap-2 mb-4">
              <Button onClick={() => setShowTaskForm(true)}>
                Create Task
              </Button>
              {isAdmin && (
                <Button variant="destructive" onClick={handleDeleteProject} disabled={isDeletingProject}>
                  {isDeletingProject ? 'Deleting...' : 'Delete Project'}
                </Button>
              )}
            </div>
          )}
          {showTaskForm && (isAdmin || isEmployeeInProject) && (
            <div className="mb-4 p-4 border rounded-lg bg-secondary/10">
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
                <Button onClick={handleCreateTask} disabled={isSaving}>
                  {isSaving ? 'Creating...' : 'Create'}
                </Button>
                <Button variant="outline" onClick={() => setShowTaskForm(false)} disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
          <h3 className="font-semibold mb-2">Tasks</h3>
          {tasks.length === 0 ? (
            <p className="text-muted-foreground">No tasks found for this project.</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => {
                // Find assigned user name if not present
                let assignedName = task.assignedUserName;
                if (!assignedName && task.assignedUserId) {
                  const assignedUser = users.find(u => u.id === task.assignedUserId);
                  assignedName = assignedUser ? assignedUser.userName : undefined;
                }
                return (
                  <div key={task.id} className="border rounded p-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {task.description}
                        {assignedName && (
                          <span className="ml-2 text-xs text-primary font-semibold">(Assigned to: {assignedName})</span>
                        )}
                        {!assignedName && (
                          <span className="ml-2 text-xs text-muted-foreground">(Unassigned)</span>
                        )}
                      </div>
                    </div>
                    {isAdmin && (
                      <Button variant="outline" size="sm" onClick={() => handleDeleteTask(task.id)}>
                        Remove
                      </Button>
                    )}
                    {isEmployee && Number(user?.id) === task.assignedUserId && (
                      <Button variant="outline" size="sm" onClick={() => navigate(`/tasks/${task.id}`)}>
                        Edit
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetails;
