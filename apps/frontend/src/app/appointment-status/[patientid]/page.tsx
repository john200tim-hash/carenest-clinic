'use client';

import { useEffect, useState } from 'react';
import { Patient } from '@/types/patient';
import { Appointment } from '@/types/appointment';
import { formatDate } from '@/lib/formatDate';

interface Props {
  params: { patientId: string };
}

export default function AppointmentStatusPage({ params }: Props) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // This is a public page, so we don't need auth headers
      // In a real app, you might have a public endpoint or a different auth method
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/public/patients/${params.patientId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch patient status.');
        }
        const data = await response.json();

        setPatient({
          id: data.id,
          name: data.name,
          // Fill in other required Patient fields with defaults or from data if available
          dateOfBirth: new Date(), gender: 'N/A', contactNumber: 'N/A', address: 'N/A'
        });
        setAppointments(data.appointments.map((appt: any) => ({ ...appt, date: new Date(appt.date) })));


      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.patientId]);

  if (loading) return <p className="text-center mt-10">Loading Status...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="p-8 border rounded-lg shadow-lg bg-white">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Appointment Status</h1>
            <p className="text-lg text-gray-600"> 
              Thank you, <span className="font-semibold">{patient?.name || 'Patient'}</span>. Your request has been received.
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 print-hidden"
          >
            Print
          </button>
        </div>

        <div className="space-y-4">
          <p>Please keep this information for your records. You can use your Patient ID to check your status later.</p>
          <div className="p-4 bg-gray-100 rounded-md">
            <h3 className="font-semibold text-gray-700">Your Patient ID</h3>
            <p className="font-mono text-2xl text-indigo-600 tracking-wider">{params.patientId}</p>
          </div>

          <div className="p-4 border rounded-lg shadow-sm bg-white">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Your Appointments</h3>
            {appointments.length > 0 ? (
              <ul className="list-disc list-inside space-y-2">
                {appointments.map(appt => (
                  <li key={appt.id}><strong>{formatDate(new Date(appt.date))} at {appt.time}</strong> for "{appt.reason}" (Status: <span className="capitalize">{appt.status}</span>)</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No appointments found yet.</p>
            )}
          </div>
          <div className="p-4 bg-blue-50 border-l-4 border-blue-500 mt-4">
            <h3 className="font-semibold text-blue-800">Treatment Overview</h3>
            <p className="text-blue-700">Awaiting submission from doctor. Please check back later.</p>
          </div>
        </div>
      </div>
    </div>
  );
}