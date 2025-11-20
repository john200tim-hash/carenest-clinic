'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DoctorUser {
  id: string;
  name: string;
  email: string;
  token: string;
}

interface AuthContextType {
  doctorUser: DoctorUser | null;
  registerDoctor: (name: string, email: string, password: string, registrationCode: string) => Promise<void>;
  loginDoctor: (email: string, password: string) => Promise<void>;
  logoutDoctor: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [doctorUser, setDoctorUser] = useState<DoctorUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    // --- TEMPORARY BYPASS: Mock a logged-in user for development ---
    const mockDoctor: DoctorUser = {
      id: 'doc_dev_123',
      name: 'Dr. Developer',
      email: 'dev@clinic.com',
      token: 'mock-jwt-for-development'
    };
    setDoctorUser(mockDoctor);
    setLoading(false);

    /* --- ORIGINAL AUTH LOGIC (To be restored later) ---
    const token = localStorage.getItem('doctorToken'), id = localStorage.getItem('doctorId'), name = localStorage.getItem('doctorName'), email = localStorage.getItem('doctorEmail');
    if (token && id && name && email) { setDoctorUser({ id, name, email, token }); }
    setLoading(false);
    */
  }, []);

  const registerDoctor = async (name: string, email: string, password: string, registrationCode: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/doctor/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, registrationCode }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed.');
    }

    const user: DoctorUser = { id: data.id, name: data.name, email, token: data.token };
    setDoctorUser(user);
    localStorage.setItem('doctorToken', user.token);
    localStorage.setItem('doctorEmail', user.email);
    localStorage.setItem('doctorId', user.id);
    localStorage.setItem('doctorName', user.name);
    router.push('/doctors/dashboard');
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

    const user: DoctorUser = { id: data.id, name: data.name, email, token: data.token };
    setDoctorUser(user);
    localStorage.setItem('doctorToken', user.token);
    localStorage.setItem('doctorEmail', user.email);
    localStorage.setItem('doctorId', user.id);
    localStorage.setItem('doctorName', user.name);
    router.push('/doctors/dashboard');
  };

  const logoutDoctor = () => {
    setDoctorUser(null);
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('doctorEmail');
    localStorage.removeItem('doctorId');
    localStorage.removeItem('doctorName');
    router.push('/doctors/login');
  };

  const value: AuthContextType = {
    doctorUser,
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