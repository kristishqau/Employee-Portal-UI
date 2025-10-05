import { create } from 'zustand';
import { User, setAuthToken, clearAuth, getStoredUser } from '@/lib/auth';
import api from '@/lib/axios';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  initialize: () => {
    const user = getStoredUser();
    set({ user, isLoading: false });
  },

  login: async (username: string, password: string) => {
    // Send credentials in the request body as JSON (API expects application/json)
    const response = await api.post('/api/User/login', { username, password });

  const { token, profilePictureUrl } = response.data;
    
    if (!token) {
      throw new Error('No token received from server');
    }
    
    // Store token
    setAuthToken(token);

    // Store profile picture if provided (getStoredUser will read this)
    if (profilePictureUrl) {
      localStorage.setItem('profilePictureUrl', profilePictureUrl);
    }

    // Get user from stored token (this will decode it properly)
    const user = getStoredUser();
    
    if (!user) {
      throw new Error('Failed to decode user from token');
    }

    set({ user });
  },

  logout: () => {
    clearAuth();
    set({ user: null });
  },

  updateUser: (user: User) => {
    if (user.profilePictureUrl) {
      localStorage.setItem('profilePictureUrl', user.profilePictureUrl);
    }
    set({ user });
  },
}));
