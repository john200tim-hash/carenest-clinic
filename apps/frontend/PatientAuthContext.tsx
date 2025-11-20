'use client';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Patient } from '@/types/patient';

interface PatientAuthContextType {
  patientUser: Patient | null;
  patientLogin: (patientData: Patient) => void;
  patientLogout: () => void;
}

const PatientAuthContext = createContext<PatientAuthContextType | undefined>(undefined);

interface PatientAuthProviderProps {
  children: ReactNode;
}

export const PatientAuthProvider = ({ children }: PatientAuthProviderProps) => {
  const [patientUser, setPatientUser] = useState<Patient | null>(null);

  useEffect(() => {
    const storedPatient = localStorage.getItem('patientUser');
    if (storedPatient) {
      setPatientUser(JSON.parse(storedPatient));
    }
  }, []);

  const patientLogin = (patientData: Patient) => {
    localStorage.setItem('patientUser', JSON.stringify(patientData));
    setPatientUser(patientData);
  };

  const patientLogout = () => {
    localStorage.removeItem('patientUser');
    setPatientUser(null);
  };

  return (
    <PatientAuthContext.Provider value={{ patientUser, patientLogin, patientLogout }}>
      {children}
    </PatientAuthContext.Provider>
  );
};

export const usePatientAuth = () => {
  const context = useContext(PatientAuthContext);
  if (!context) {
    throw new Error('usePatientAuth must be used within a PatientAuthProvider');
  }
  return context;
};