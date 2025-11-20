'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminUser {
  email: string;
  token: string;
}

interface AuthContextType {
  adminUser: AdminUser | null;
  registerDoctor: (email: string, password: string, registrationCode: string) => Promise<string>;
  loginDoctor: (email: string, password: string) => Promise<void>;
  logoutDoctor: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    // Check for a token in local storage on initial load
    const token = localStorage.getItem('adminToken');
    const email = localStorage.getItem('adminEmail');
    if (token && email) {
      setAdminUser({ email, token });
    }
    setLoading(false);
  }, []);

  const registerDoctor = async (name: string, email: string, password: string, registrationCode: string): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/api/doctor/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, registrationCode }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed.');
    }

     localStorage.setItem('adminEmail', email);
    return data.message; // e.g., "Registration successful. Please log in."
  };

  const loginDoctor = async (email: string, password: string) => {
    setError(null);
    const response = await fetch(`${API_BASE_URL}/api/doctor/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed.');
    }

    const user: AdminUser = { email, token: data.token };
    setAdminUser(user);
    localStorage.setItem('adminToken', user.token);
    localStorage.setItem('adminEmail', user.email);
    router.push('/patients'); // Redirect to patient list after login
  };

  const logoutDoctor = () => {
    setAdminUser(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    router.push('/doctors/login');
  };

  const value: AuthContextType = {
    adminUser,
    registerDoctor,
    loginDoctor,
    logoutDoctor,
    loading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};