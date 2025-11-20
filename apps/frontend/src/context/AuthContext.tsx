'use client';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AdminUser {
  id: string;
  email: string;
  token: string;
  role: 'admin' | 'doctor';
}

interface AuthContextType {
  adminUser: AdminUser | null;
  adminLogin: (email: string, token: string, role: 'admin' | 'doctor') => void;
  adminLogout: () => void;

}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    // Check for existing token in localStorage on mount
    const storedToken = localStorage.getItem('adminToken');
    const storedEmail = localStorage.getItem('adminEmail');
    const storedRole = localStorage.getItem('adminRole') as 'admin' | 'doctor' | null;

    if (storedToken && storedEmail && storedRole) {
      setAdminUser({ id: 'user', email: storedEmail, token: storedToken, role: storedRole });
    }
  }, []);

  const adminLogin = (email: string, token: string, role: string) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminEmail', email);
    localStorage.setItem('adminRole', role);
    setAdminUser({ id: 'user', email, token, role: role as 'admin' | 'doctor' });

  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminRole');
    setAdminUser(null);
  };

  return (
    <AuthContext.Provider value={{ adminUser, adminLogin, adminLogout }}>
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