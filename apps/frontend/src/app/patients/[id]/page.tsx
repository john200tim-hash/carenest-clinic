'use client';

import React, { useEffect, useState } from 'react';
import useAuth from '@/hooks/useAuth'; // For doctor's view
import { Patient } from '@/types/patient';
import { formatDate } from '@/lib/formatDate';
import MedicalInfoManager from '@/components/MedicalInfoManager';
import { Appointment } from '@/types/appointment';
import { usePatients } from '@/context/PatientContext'; // Import the context hook

interface Props {
  params: { id: string };
}

const PatientDetailPage = ({ params }: Props) => {
  const { adminUser } = useAuth(); // Check if a doctor is logged in
  const { getAuthHeaders } = usePatients(); // Get the headers function from the context
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        // Determine which endpoint to use based on who is logged in
        const isDoctor = !!adminUser;
        // The API URL now comes from the environment variable
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
        const url = `${API_BASE_URL}/api/patients/${params.id}`;

        const response = await fetch(url, { headers: getAuthHeaders() });

        if (!response.ok) {
          throw new Error('Patient not found or failed to fetch data.');
        }
        const fetchedPatient: Patient = await response.json();
        fetchedPatient.dateOfBirth = new Date(fetchedPatient.dateOfBirth);

        // Fetch appointments for this patient
        const apptResponse = await fetch(`${API_BASE_URL}/api/patients/${params.id}/appointments`, { headers: getAuthHeaders() });
        if (apptResponse.ok) {
          const fetchedAppointments: Appointment[] = await apptResponse.json();
          setAppointments(fetchedAppointments.map(a => ({...a, date: new Date(a.date)})));
        }

        setPatient(fetchedPatient);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [params.id, adminUser]);

  if (loading) return <p>Loading patient details...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!patient) return <p>Patient not found.</p>;

  return (
    <div className="flex gap-8">
      {/* Left Sidebar for Settings */}
      <aside className="w-1/4 p-6 bg-gray-100 rounded-lg print-hidden">
        <h2 className="text-xl font-bold mb-4">Settings</h2>
        <div className="space-y-2">
          <div className="p-3 bg-white rounded-md shadow-sm">
            <h3 className="font-semibold text-gray-700">Name</h3>
            <p className="text-gray-600">{patient.name}</p>
          </div>
          <div className="p-3 bg-white rounded-md shadow-sm">
            <h3 className="font-semibold text-gray-700">Patient ID</h3>
            <p className="font-mono text-gray-600">{patient.id}</p>
          </div>
          <div className="p-3 bg-white rounded-md shadow-sm">
            <h3 className="font-semibold text-gray-700">Email/Mobile</h3>
            <p className="text-gray-600">{patient.emailOrMobile || patient.contactNumber}</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div id="treatment-overview" className="w-3/4 space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Treatment Overview</h1>
            <p className="text-lg text-gray-600">for {patient.name} (ID: {patient.id})</p>
          </div>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 print-hidden"
          >
            Print Overview
          </button>
        </div>

        {/* Appointments Section */}
        <div className="p-6 border rounded-lg shadow-md bg-white">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Appointments</h2>
          {loading ? <p>Loading appointments...</p> : appointments.length > 0 ? (
            <ul className="list-disc list-inside space-y-2">
              {appointments.map(appt => (
                <li key={appt.id}>
                  <strong>{formatDate(new Date(appt.date))} at {appt.time}</strong> with Dr. {appt.doctorId} for "{appt.reason}" (Status: <span className="capitalize">{appt.status}</span>)
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No appointments found.</p>
          )}
        </div>

        {/* Medical Information Sections - Only show management tools if a doctor is logged in */}
        {adminUser ? (
          <div className="space-y-8">
            <MedicalInfoManager patient={patient} infoType="symptoms" />
            <MedicalInfoManager patient={patient} infoType="diagnoses" />
            <MedicalInfoManager patient={patient} infoType="prescriptions" />
            <MedicalInfoManager patient={patient} infoType="bills" />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PatientDetailPage;