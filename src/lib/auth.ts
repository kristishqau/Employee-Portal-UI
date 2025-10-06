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

export const createDemoToken = (user: User): string => {
  // Create a simple JWT-like token for demo mode
  const payload = {
    nameid: user.id,
    name: user.userName,
    role: user.role,
    id: user.id,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours from now
    nbf: Math.floor(Date.now() / 1000),
    iat: Math.floor(Date.now() / 1000)
  };

  // Create a base64-encoded version of the payload using browser's btoa
  const base64Payload = btoa(JSON.stringify(payload));
  // Add a fake header and signature to make it look like a real JWT
  const fakeHeader = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const fakeSignature = btoa('demo-signature');

  // URLencode the base64 strings to make them URL-safe (replacing + with - and / with _)
  const urlSafeHeader = fakeHeader.replace(/\+/g, '-').replace(/\//g, '_');
  const urlSafePayload = base64Payload.replace(/\+/g, '-').replace(/\//g, '_');
  const urlSafeSignature = fakeSignature.replace(/\+/g, '-').replace(/\//g, '_');

  return `${urlSafeHeader}.${urlSafePayload}.${urlSafeSignature}`;
};
