import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Search, FolderKanban } from 'lucide-react';
import api from '@/lib/axios';
import { Link } from 'react-router-dom';

interface Project {
  id: number;
  name: string;
  description: string;
}

const Projects = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const isAdmin = user?.role === 'Administrator';
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      // Use the endpoint that returns projects for the current user
      const endpoint = isAdmin ? '/api/Project' : '/api/Project/GetProjectsForUser';
      const response = await api.get(endpoint);
      setProjects(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    setIsSaving(true);
    try {
      await api.post('/api/Project', {
        name: newProject.name,
        description: newProject.description,
      }, {
        params: { userId: user?.id }
      });
      setShowProjectForm(false);
      setNewProject({ name: '', description: '' });
      fetchProjects();
      toast({ title: 'Success', description: 'Project created successfully' });
    } catch {
      toast({ title: 'Error', description: 'Failed to create project', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-2">
            {isAdmin ? 'Manage all projects' : 'View your assigned projects'}
          </p>
        </div>
        {isAdmin && (
          <>
            <Button onClick={() => setShowProjectForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
            {showProjectForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md">
                  <h2 className="text-xl font-bold mb-4">Create New Project</h2>
                  <div className="space-y-3 mb-4">
                    <Input
                      placeholder="Project Name"
                      value={newProject.name}
                      onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                      disabled={isSaving}
                    />
                    <Input
                      placeholder="Description"
                      value={newProject.description}
                      onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateProject} disabled={isSaving || !newProject.name}>
                      {isSaving ? 'Creating...' : 'Create'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowProjectForm(false)} disabled={isSaving}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Projects grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderKanban className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No projects found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery ? 'Try adjusting your search' : 'Create your first project to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-all cursor-pointer group">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {project.name}
                  </CardTitle>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {project.description || 'No description available'}
                </p>
                <Link to={`/projects/${project.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
