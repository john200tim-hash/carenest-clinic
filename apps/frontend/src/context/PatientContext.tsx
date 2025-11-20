'use client';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Patient } from '@/types/patient';
import { useAuth } from './AuthContext';

interface PatientContextType {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  addPatient: (patient: Omit<Patient, 'id'>) => Promise<void>;
  updatePatient: (patient: Patient) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  getPatientById: (id: string) => Promise<Patient | null>;
  addMedicalInfo: (patientId: string, infoType: string, data: any) => Promise<void>;
}

interface PatientProviderProps {
  children: ReactNode;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider = ({ children }: PatientProviderProps) => {
  const { adminUser } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use an environment variable for the backend URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (adminUser?.token) {
      headers['Authorization'] = `Bearer ${adminUser.token}`;
    }
    return headers;
  };

  const fetchPatients = async () => {
    if (!adminUser?.token) {
      setLoading(false);
      return; // Don't fetch if not authenticated
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/patients`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }
      const data: Patient[] = await response.json();
      const patientsWithDates = data.map(p => ({
        ...p,
        dateOfBirth: new Date(p.dateOfBirth),
      }));
      setPatients(patientsWithDates);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [adminUser?.token]);

  const addPatient = async (patient: Omit<Patient, 'id'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...patient, dateOfBirth: patient.dateOfBirth.toISOString() }),
      });
      if (!response.ok) {
        throw new Error('Failed to add patient');
      }
      const newPatient: Patient = await response.json();
      setPatients((prevPatients) => [...prevPatients, { ...newPatient, dateOfBirth: new Date(newPatient.dateOfBirth) }]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updatePatient = async (updatedPatient: Patient) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${updatedPatient.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...updatedPatient, dateOfBirth: updatedPatient.dateOfBirth.toISOString() }),
      });
      if (!response.ok) {
        throw new Error('Failed to update patient');
      }
      const returnedPatient: Patient = await response.json();
      setPatients((prevPatients) =>
        prevPatients.map((p) =>
          p.id === returnedPatient.id ? { ...returnedPatient, dateOfBirth: new Date(returnedPatient.dateOfBirth) } : p
        )
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deletePatient = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to delete patient');
      }
      setPatients((prevPatients) => prevPatients.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getPatientById = async (id: string): Promise<Patient | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch patient');
      }
      const patient: Patient = await response.json();
      return { ...patient, dateOfBirth: new Date(patient.dateOfBirth) };
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const addMedicalInfo = async (patientId: string, infoType: string, data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/${infoType}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to add ${infoType}`);
      }
      await fetchPatients();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const value: PatientContextType = {
    patients,
    loading,
    error,
    addPatient,
    updatePatient,
    deletePatient,
    getPatientById,
    addMedicalInfo,
  };

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatients = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
};