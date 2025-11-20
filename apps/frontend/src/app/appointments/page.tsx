'use client';
import { useAppointments } from "@/context/AppointmentContext";
import AppointmentForm from "@/components/AppointmentForm";
import { formatDate } from "@/lib/formatDate";

const AppointmentsPage = () => {
  const { appointments, loading, error } = useAppointments();

  if (loading) return <p>Loading appointments...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">Schedule an Appointment</h1>
        <AppointmentForm />
      </div>
      <div>
        <h1 className="text-2xl font-bold mb-6">Upcoming Appointments</h1>
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <p>No appointments scheduled yet.</p>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment.id} className="border rounded-md p-4 shadow-sm bg-white">
                <h3 className="text-lg font-semibold text-blue-700">Appointment with Doctor {appointment.doctorId}</h3>
                <p className="text-sm text-gray-600"><strong>Patient ID:</strong> {appointment.patientId}</p>
                <p className="text-sm text-gray-600"><strong>Date:</strong> {formatDate(appointment.date)} at {appointment.time}</p>
                <p className="text-sm text-gray-600"><strong>Reason:</strong> {appointment.reason}</p>
                <p className="text-sm font-bold text-gray-700"><strong>Status:</strong> <span className="capitalize">{appointment.status}</span></p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;