'use client';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Patient } from '@/types/patient'; // Import your Patient type
import { useAuth } from './AuthContext'; // Import useAuth for token

interface PatientContextType {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  addPatient: (patient: Omit<Patient, 'id'>) => Promise<void>;
  updatePatient: (patient: Patient) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  getPatientById: (id: string) => Promise<Patient | null>;
  addMedicalInfo: (patientId: string, infoType: string, data: any) => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

interface PatientProviderProps {
  children: ReactNode;
}

export const PatientProvider = ({ children }: PatientProviderProps) => { // Renamed from AdminUser to DoctorUser
  const { doctorUser } = useAuth(); // Use doctorUser
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use an environment variable for the backend URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (doctorUser?.token) { // Use doctorUser
      headers['Authorization'] = `Bearer ${doctorUser.token}`; // Use doctorUser
    }
    return headers;
  };

  const fetchPatients = async () => {
    if (!doctorUser?.token) { // Use doctorUser
      setLoading(false);
      return; // Don't fetch if not authenticated
    }
    setLoading(true);
    setError(null);

    // --- Live Data Fetching Logic ---
    try {
      const response = await fetch(`${API_BASE_URL}/patients`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }
      const data: Patient[] = await response.json();
      // Convert date strings from backend to Date objects
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
  }, [doctorUser?.token]); // Corrected dependency

  const addPatient = async (patient: Omit<Patient, 'id'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...patient, dateOfBirth: patient.dateOfBirth.toISOString() }), // Send date as ISO string
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
      // Refetch all patients to get the updated data. In a real app, you might just update the single patient state.
    await fetchPatients(); // This will trigger a re-render with updated patient data
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
    getAuthHeaders,
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