'use client';

import { useEffect, useState } from 'react';
import { Patient } from '@/types/patient'; // Assuming this has all the medical info fields
import { Appointment } from '@/types/appointment';
import { formatDate } from '@/lib/formatDate';

type PatientView = 'appointments' | 'records';

// A simplified type for the public patient data
type PublicPatientData = Patient & { appointments: Appointment[] };
interface Props {
  params: { patientId: string };
}

export default function AppointmentStatusPage({ params }: Props) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PatientView>('appointments');

  useEffect(() => {
    const fetchData = async () => {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/public/patients/${params.patientId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch your records. Please check your Patient ID.');
        }
        const data: PublicPatientData = await response.json();

        setPatient(data);
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

  const TabButton = ({ tabName, label }: { tabName: PatientView, label: string }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === tabName ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="p-8 border rounded-lg shadow-lg bg-white">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Appointment Status</h1>
            <p className="text-lg text-gray-600"> 
              Welcome, <span className="font-semibold">{patient?.name || 'Patient'}</span>.
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

          {/* Tab Navigation */}
          <div className="flex space-x-2 border-b pb-2">
            <TabButton tabName="appointments" label="My Appointments" />
            <TabButton tabName="records" label="My Medical Records" />
          </div>

          {/* Tab Content */}
          <div className="mt-4">
            {activeTab === 'appointments' && (
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
            )}

            {activeTab === 'records' && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
                  <h3 className="font-semibold text-blue-800">Symptoms</h3>
                  <p className="text-blue-700">{patient?.symptoms?.map(s => s.description).join(', ') || 'No symptoms recorded.'}</p>
                </div>
                <div className="p-4 bg-green-50 border-l-4 border-green-500">
                  <h3 className="font-semibold text-green-800">Diagnoses</h3>
                  <p className="text-green-700">{patient?.diagnoses?.map(d => d.condition).join(', ') || 'No diagnoses recorded.'}</p>
                </div>
                <div className="p-4 bg-purple-50 border-l-4 border-purple-500">
                  <h3 className="font-semibold text-purple-800">Prescriptions</h3>
                  <p className="text-purple-700">{patient?.prescriptions?.map(p => p.medication).join(', ') || 'No prescriptions recorded.'}</p>
                </div>
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500">
                  <h3 className="font-semibold text-yellow-800">Bills</h3>
                  <p className="text-yellow-700">{patient?.bills?.map(b => `${b.description}: $${b.amount} (${b.status})`).join(', ') || 'No bills recorded.'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}