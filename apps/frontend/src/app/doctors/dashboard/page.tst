'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Patient } from '@/types/patient';
import { Appointment } from '@/types/appointment';
import { formatDate } from '@/lib/formatDate';
import Link from 'next/link';

type DoctorDashboardView = 'appointments' | 'schedule' | 'patients';

const DoctorDashboardPage = () => {
  const { doctorUser } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DoctorDashboardView>('appointments');

  useEffect(() => {
    const fetchData = async () => {
      if (!doctorUser?.token) return;

      setLoading(true);
      setError(null);

      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

        // Fetch appointments for the logged-in doctor
        const appointmentsResponse = await fetch(`${API_BASE_URL}/api/doctors/${doctorUser.id}/appointments`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${doctorUser.token}`
          }
        });
        if (!appointmentsResponse.ok) {
          throw new Error('Failed to fetch appointments');
        }
        const appointmentsData: Appointment[] = await appointmentsResponse.json();
        setAppointments(appointmentsData.map(appt => ({ ...appt, date: new Date(appt.date) })));

        // Fetch all patients (for the patient list)
        const patientsResponse = await fetch(`${API_BASE_URL}/api/patients`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${doctorUser.token}`
          }
        });
        if (!patientsResponse.ok) {
          throw new Error('Failed to fetch patients');
        }
        const patientsData: Patient[] = await patientsResponse.json();
        setPatients(patientsData.map(p => ({ ...p, dateOfBirth: new Date(p.dateOfBirth) })));

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [doctorUser]);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  const TabButton = ({ tabName, label }: { tabName: DoctorDashboardView, label: string }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === tabName ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Doctor Dashboard</h1>

      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b pb-2">
        <TabButton tabName="appointments" label="Appointment Tracking" />
        <TabButton tabName="schedule" label="Schedule Appointment" />
        <TabButton tabName="patients" label="Patient Records" />
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'appointments' && (
          <div className="p-4 border rounded-lg shadow-sm bg-white">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Your Appointments</h3>
            {appointments.length > 0 ? (
              <ul className="list-disc list-inside space-y-2">
                {appointments.map(appt => (
                  <li key={appt.id}><strong>{formatDate(new Date(appt.date))} at {appt.time}</strong> with {appt.patientName} (Reason: {appt.reason})</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No appointments found.</p>
            )}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="p-4 border rounded-lg shadow-sm bg-white">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Schedule Appointment</h3>
            {/* Add your appointment scheduling form here */}
            <p className="text-gray-500">Appointment scheduling form will go here.</p>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="p-4 border rounded-lg shadow-sm bg-white">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Patient Records</h3>
            {patients.length > 0 ? (
              <ul className="space-y-2
