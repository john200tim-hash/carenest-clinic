'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Patient } from '@/types/patient'; // This should now import all sub-types
import EditPatientForm from '@/components/EditPatientForm'; // Import the new form
import { formatDate } from '@/lib/formatDate';
import MedicalInfoManager from '@/components/MedicalInfoManager';
import { Appointment } from '@/types/appointment';
import { usePatients } from '@/context/PatientContext';

interface Props {
  params: { id: string };
}

const PatientDetailPage = ({ params }: Props) => {
  const { doctorUser } = useAuth(); // Use doctorUser
  const { getAuthHeaders, patients } = usePatients(); // Get patients to find the specific one
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false); // State to control the modal

  useEffect(() => {
    const fetchPatient = async () => {
      // Definitive Fix: Do not attempt to fetch data until the user is authenticated.
      if (!doctorUser?.token) { // Use doctorUser
        // You can optionally set an error or just wait. Returning here is key.
        return;
      }

      try {
        // Instead of re-fetching, find the patient from the context for faster load times
        setLoading(true);
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
  }, [params.id, doctorUser, patients]); // Re-run if the main patients list changes

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
          {doctorUser && (
            <button onClick={() => setIsEditing(true)} className="w-full mt-4 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
              Edit Details
            </button>
          )}
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

        {/* Medical Information Sections - Only show management tools if a doctor is logged in */}
        {doctorUser ? ( // Use doctorUser
          <MedicalInfoManager patient={patient} />
        ) : null}
      </div>

      {isEditing && (
        <EditPatientForm patient={patient} onClose={() => setIsEditing(false)} />
      )}
    </div>
  );
};

export default PatientDetailPage;