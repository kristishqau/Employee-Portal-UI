import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import api from '@/lib/axios';

interface UserProfile {
  id: number;
  userName: string;
  role: string;
  profilePictureUrl?: string;
}

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    id: 0,
    userName: '',
    role: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await api.get(`/api/User/${user.id}`);
      setProfile(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put(`/api/User/${profile.id}`, profile);
      
      updateUser({
        id: user!.id,
        userName: profile.userName,
        role: profile.role,
        profilePictureUrl: profile.profilePictureUrl,
      });

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.Message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File size must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingPicture(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/api/User/${profile.id}/profilepicture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newProfilePictureUrl = response.data.profilePictureUrl || URL.createObjectURL(file);
      
      setProfile({ ...profile, profilePictureUrl: newProfilePictureUrl });
      updateUser({
        id: user!.id,
        userName: profile.userName,
        role: profile.role,
        profilePictureUrl: newProfilePictureUrl,
      });

      toast({
        title: 'Success',
        description: 'Profile picture updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.Message || 'Failed to upload profile picture',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingPicture(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your account information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar section */}
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.profilePictureUrl} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {profile.userName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <input
                type="file"
                id="profile-picture"
                className="hidden"
                accept="image/*"
                onChange={handlePictureUpload}
                disabled={isUploadingPicture}
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => document.getElementById('profile-picture')?.click()}
                disabled={isUploadingPicture}
              >
                {isUploadingPicture ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Upload Picture
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Max 5MB • JPG, PNG, GIF
              </p>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={profile.userName}
                onChange={(e) => setProfile({ ...profile, userName: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={profile.role} disabled />
            </div>
          </div>

          {/* Action buttons */}
          {!isEditing ? (
            <div className="flex gap-3 pt-4">
              <Button onClick={() => setIsEditing(true)}>
                Update
              </Button>
            </div>
          ) : (
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => { setIsEditing(false); fetchProfile(); }} disabled={isSaving}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
