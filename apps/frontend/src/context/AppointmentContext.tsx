'use client';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Appointment } from '@/types/appointment';
import { useAuth } from './AuthContext';

interface AppointmentContextType {
  appointments: Appointment[];
  setAppointments: (appointments: Appointment[]) => void; // Added setter
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointment: (appointment: Appointment) => void;
  deleteAppointment: (id: string) => void;
  loading: boolean;
  error: string | null;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

interface AppointmentProviderProps {
  children: ReactNode;
}

export const AppointmentProvider = ({ children }: AppointmentProviderProps) => {
  const { doctorUser } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = '/api';
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${doctorUser?.token}`,
    'Content-Type': 'application/json', 
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!doctorUser?.token) {
        setAppointments([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/appointments`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to fetch appointments');
        const data: Appointment[] = await response.json();
        setAppointments(data.map(appt => ({ ...appt, date: new Date(appt.date) })));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [doctorUser?.token]);

  const addAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    if (!doctorUser?.token) {
      setError("Authentication required to add an appointment.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...appointment, date: appointment.date.toISOString() }),
      });
      if (!response.ok) throw new Error('Failed to add appointment');
      const newAppointment: Appointment = await response.json();
      setAppointments(prev => [...prev, { ...newAppointment, date: new Date(newAppointment.date) }]);
    } catch (err: any) {
      setError(err.message);
      throw err; // Re-throw to be caught in the form
    }
  };

  const updateAppointment = (appointment: any) => {
    setAppointments(
      appointments.map((appt) => (appt.id === appointment.id ? appointment : appt))
    );
  };

  const deleteAppointment = (id: string) => {
    setAppointments(appointments.filter((appt) => appt.id !== id));
  };

  const value: AppointmentContextType = {
    appointments,
    setAppointments, // Expose setter
    addAppointment,
    updateAppointment,
    deleteAppointment,
    loading,
    error,
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};
