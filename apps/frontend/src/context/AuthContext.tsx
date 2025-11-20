'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminUser {
  id: string; // Doctor's ID
  name: string; // Doctor's Name
  email: string; // Doctor's Email
  token: string; // Doctor's JWT
}

interface AuthContextType { // Renamed from AdminUser to DoctorUser
  doctorUser: DoctorUser | null;
  registerDoctor: (name: string, email: string, password: string, registrationCode: string) => Promise<void>;
  loginDoctor: (email: string, password: string) => Promise<void>;
  logoutDoctor: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined); // Renamed from AdminUser to DoctorUser

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [doctorUser, setDoctorUser] = useState<DoctorUser | null>(null); // Renamed from adminUser to doctorUser
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    // Check for a token in local storage on initial load
    const token = localStorage.getItem('doctorToken');
    const id = localStorage.getItem('doctorId');
    const name = localStorage.getItem('doctorName');
    const email = localStorage.getItem('doctorEmail');
    if (token && id && name && email) {
      setDoctorUser({ id, name, email, token }); // Ensure all properties are set
    }
    setLoading(false);
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

    // --- FIX: Handle automatic login after registration ---
    const user: DoctorUser = { id: data.id, name: data.name, email, token: data.token };
    setDoctorUser(user);
    localStorage.setItem('doctorToken', user.token);
    localStorage.setItem('doctorEmail', user.email);
    localStorage.setItem('doctorId', user.id);
    localStorage.setItem('doctorName', user.name);
    router.push('/patients'); // Redirect to the main doctor page
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

    const user: DoctorUser = { id: data.id, name: data.name, email: data.email, token: data.token }; // Ensure all properties are set
    setDoctorUser(user); // Use setDoctorUser
    localStorage.setItem('doctorToken', user.token); // Renamed localStorage key
    localStorage.setItem('doctorEmail', user.email); // Renamed localStorage key
    localStorage.setItem('doctorId', user.id); // Renamed localStorage key
    localStorage.setItem('doctorName', user.name); // Renamed localStorage key
    router.push('/patients'); // Redirect to patient list after login
  };

  const logoutDoctor = () => {
    setDoctorUser(null); // Use setDoctorUser
    localStorage.removeItem('doctorToken'); // Renamed localStorage key
    localStorage.removeItem('doctorEmail'); // Renamed localStorage key
    localStorage.removeItem('doctorId'); // Renamed localStorage key
    localStorage.removeItem('doctorName'); // Renamed localStorage key
    router.push('/doctors/login');
  };

  const value: AuthContextType = { // Renamed from AdminUser to DoctorUser
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