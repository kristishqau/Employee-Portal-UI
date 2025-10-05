import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Search, Users as UsersIcon, Trash2, Edit } from 'lucide-react';
import api from '@/lib/axios';
import { UserFormDialog } from '@/components/UserFormDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface User {
  id: number;
  userName: string;
  role: string;
  profilePictureUrl?: string;
}

const Users = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/User');
      setUsers(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrUpdate = async (data: any) => {
    setIsSaving(true);
    try {
      if (data.id) {
        // Update user
        const updateData: any = {
          userName: data.userName,
          role: data.role,
        };
        if (data.password) {
          updateData.password = data.password;
        }
        await api.put(`/api/User/${data.id}`, updateData);
        toast({
          title: 'Success',
          description: 'User updated successfully',
        });
      } else {
        // Create user
        await api.post('/api/User', {
          userName: data.userName,
          password: data.password,
          role: data.role,
        });
        toast({
          title: 'Success',
          description: 'User created successfully',
        });
      }
      setIsFormOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.Message || `Failed to ${data.id ? 'update' : 'create'} user`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.user) return;

    try {
      await api.delete(`/api/User/${deleteDialog.user.id}`);
      setUsers(users.filter(u => u.id !== deleteDialog.user!.id));
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.Message || 'Failed to delete user',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialog({ open: false, user: null });
    }
  };

  const filteredUsers = users.filter((user) =>
    user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-2">Manage employees and administrators</p>
        </div>
        <Button onClick={() => {
          setSelectedUser(null);
          setIsFormOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          New User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === 'Administrator').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Administrators</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.role === 'Employee').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Employees</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users list */}
      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <UsersIcon className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No users found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery ? 'Try adjusting your search' : 'Add your first user to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user.profilePictureUrl} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.userName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{user.userName}</h3>
                    <Badge variant={user.role === 'Administrator' ? 'default' : 'secondary'} className="mt-1">
                      {user.role}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedUser(user);
                      setIsFormOpen(true);
                    }}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteDialog({ open: true, user })}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <UserFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setSelectedUser(null);
        }}
        onSubmit={handleCreateOrUpdate}
        user={selectedUser}
        isLoading={isSaving}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, user: null })}
        onConfirm={handleDelete}
        title="Delete User"
        description={`Are you sure you want to delete "${deleteDialog.user?.userName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default Users;
