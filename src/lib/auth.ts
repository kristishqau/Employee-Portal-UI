import { jwtDecode } from 'jwt-decode';

export interface User {
  id: string;
  userName: string;
  role: string;
  profilePictureUrl?: string;
}

interface JWTPayload {
  nameid: string;  // User ID
  name: string;    // Username
  role: string;    // Role
  id: string;      // Also contains ID
  exp: number;
  nbf: number;
  iat: number;
}

export const getStoredUser = (): User | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded = jwtDecode<JWTPayload>(token);
    
    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('profilePictureUrl');
      return null;
    }

    const user = {
      id: decoded.id || decoded.nameid,
      userName: decoded.name,
      role: decoded.role,
      profilePictureUrl: localStorage.getItem('profilePictureUrl') || undefined,
    };
    return user;
  } catch {
    return null;
  }
};

export const setAuthToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('profilePictureUrl');
};

export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'Administrator';
};

export const isEmployee = (user: User | null): boolean => {
  return user?.role === 'Employee';
};
