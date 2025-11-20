'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Appointment } from '@/types/appointment';
import { formatDate } from '@/lib/formatDate';

const DoctorAppointmentsPage = () => {
  const { adminUser } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!adminUser?.token) return;

      try {
        setLoading(true);
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${API_BASE_URL}/api/doctors/${adminUser.id}/appointments`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminUser.token}`
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
  }, [adminUser]);

  if (loading) return <p>Loading appointments...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

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
                <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800`}>
                  {appt.status}
                </span>
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