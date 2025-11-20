import { useAppointments as useAppointmentsContext } from '@/context/AppointmentContext';

const useAppointments = () => {
  // This hook now simply consumes and returns the context.
  // All logic is centralized in AppointmentProvider.
  const context = useAppointmentsContext();
  return context;
};

export default useAppointments;
