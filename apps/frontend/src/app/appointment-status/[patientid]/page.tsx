'use client';

import { useEffect, useState } from 'react';
import { Patient } from '@/types/patient';
import { Appointment } from '@/types/appointment';
import PatientReceipt from '@/components/PatientReceipt'; // Import the new component
import { formatDate } from '@/lib/formatDate';

type PatientView = 'appointments' | 'records';

interface Props {
  params: { patientId: string };
}

export default function AppointmentStatusPage({ params }: Props) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PatientView>('appointments');

  useEffect(() => {
    const fetchData = async () => {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/public/patients/${params.patientId}`); // This endpoint now returns the full patient
        if (!response.ok) {
          throw new Error('Failed to fetch your records. Please check your Patient ID.');
        }
        const data: Patient = await response.json();

        setPatient(data);

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
              Welcome, <span className="font-semibold">{patient?.name || 'Patient'}</span>
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
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Scheduled Appointments</h3>
                {patient?.appointments && patient.appointments.length > 0 ? ( // Assuming appointments are nested in patient object
                  <ul className="list-disc list-inside space-y-2">
                    {patient.appointments.map(appt => (
                      <li key={appt.id}><strong>{formatDate(new Date(appt.date))} at {appt.time}</strong> for "{appt.reason}" (Status: <span className="capitalize">{appt.status}</span>)</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No appointments have been scheduled yet.</p>
                )}
              </div>
            )}

            {activeTab === 'records' && (
              <PatientReceipt patient={patient} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}