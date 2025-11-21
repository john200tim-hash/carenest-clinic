'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Appointment } from '@/types/appointment';
import { formatDate } from '@/lib/formatDate';
import { useRouter } from 'next/navigation';
 
const DoctorAppointmentsPage = () => {
  const { doctorUser } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);  const router = useRouter();

  useEffect(() => {
  const fetchAppointments = async () => {
    if (!doctorUser?.token) return; // Use doctorUser
      try {
        setLoading(true);
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${API_BASE_URL}/api/doctors/${doctorUser.id}/appointments`, {
          headers: {
            'Content-Type': 'application/json',
          'Authorization': `Bearer ${doctorUser.token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }

        const data: Appointment[] = await response.json();
      setAppointments(data.map(appt => ({...appt, date: new Date(appt.date)})));
      } catch (err: any) {
        setError(err.message);
  } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [doctorUser]);

  if (loading) return <p>Loading appointments...</p>; 
  if (error) return <p className="text-red-500">Error: {error}</p>;

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        'Authorization': `Bearer ${doctorUser.token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update appointment status');
      // Refresh the data after a successful update
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    }
  };

 
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Your Appointments</h1>
      {appointments.length > 0 ? (
        <ul className="space-y-4">
          {appointments.map(appt => (
            <li key={appt.id} className="p-4 border rounded-lg shadow-md bg-white">
            <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold">{appt.patientName}</h3>
                  <p className="text-gray-600">Date: {formatDate(new Date(appt.date))} at {appt.time}</p>
                  <p className="text-gray-700">Reason: {appt.reason}</p>
                </div>
                <select
                  value={appt.status}
                  onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                  className="bg-gray-100 border border-gray-200 rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

 
              </div>
            </li>
          ))} 
        </ul>
      ) : (
        <p className="text-gray-500">No appointments found.</p>
      )}
    </div>
  );
};

export default DoctorAppointmentsPage;