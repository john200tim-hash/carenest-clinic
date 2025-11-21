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

  // State for the new appointment form
  const [form, setForm] = useState({ patientId: '', date: '', time: '', reason: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');


  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchData = async () => {
    if (!doctorUser?.token) return;
    setLoading(true);
    setError(null);
    try {

      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${doctorUser.token}` };
      const [appointmentsRes, patientsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/doctors/${doctorUser.id}/appointments`, { headers }),
        fetch(`${API_BASE_URL}/api/patients`, { headers }),
      ]);
      if (!appointmentsRes.ok || !patientsRes.ok) throw new Error('Failed to fetch dashboard data.');
      const appointmentsData = await appointmentsRes.json();

      const patientsData = await patientsRes.json();
      setAppointments(appointmentsData.map((a: any) => ({ ...a, date: new Date(a.date) })));
      setPatients(patientsData);
    } catch (err: any) {

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

  }, [doctorUser]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    setFormSuccess('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/doctor-create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${doctorUser!.token}` },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to create appointment.');
      setFormSuccess(`Appointment created for ${data.patientName} on ${formatDate(new Date(data.date))}.`);
      setForm({ patientId: '', date: '', time: '', reason: '' });
      fetchData(); // Refresh data after submission
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const TabButton = ({ tabName, label }: { tabName: DoctorDashboardView, label: string }) => (

    <button onClick={() => setActiveTab(tabName)} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === tabName ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
      {label}
    </button>
  );

  if (loading) return <p className="text-center mt-10">Loading Dashboard...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;


  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Doctor Dashboard</h1>
      <div className="flex space-x-2 border-b pb-2 mb-6">
        <TabButton tabName="appointments" label="Appointment Tracking" />
        <TabButton tabName="schedule" label="Schedule Appointment" />
        <TabButton tabName="patients" label="Patient Records" />
      </div>

      <div>
        {activeTab === 'appointments' && (

          <div className="p-4 border rounded-lg shadow-sm bg-white">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">All Scheduled Appointments</h3>
            {appointments.length > 0 ? (
              <ul className="space-y-2">
                {appointments.map(appt => (
                  <li key={appt.id} className="p-3 bg-gray-50 rounded-md">
                    <strong>{formatDate(new Date(appt.date))} at {appt.time}</strong> with {appt.patientName} (Status: <span className="capitalize font-semibold">{appt.status}</span>)
                  </li>
                ))}
              </ul>
            ) : <p className="text-gray-500">No appointments found.</p>}
          </div>
        )}

        {activeTab === 'schedule' && (

          <form onSubmit={handleFormSubmit} className="p-6 border rounded-lg shadow-sm bg-white space-y-4">
            <h3 className="text-xl font-semibold text-gray-700">Schedule a New Appointment</h3>
            {formError && <p className="text-red-500 bg-red-100 p-2 rounded-md">{formError}</p>}
            {formSuccess && <p className="text-green-500 bg-green-100 p-2 rounded-md">{formSuccess}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Patient</label>
              <select name="patientId" value={form.patientId} onChange={handleFormChange} className="input-field" required>
                <option value="">-- Select a Patient --</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input type="date" name="date" value={form.date} onChange={handleFormChange} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time</label>
                <input type="time" name="time" value={form.time} onChange={handleFormChange} className="input-field" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reason for Visit</label>
              <input type="text" name="reason" value={form.reason} onChange={handleFormChange} className="input-field" required />
            </div>
            <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Create Appointment</button>
          </form>
        )}

        {activeTab === 'patients' && (

          <div className="p-4 border rounded-lg shadow-sm bg-white">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">All Enrolled Patients</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Patient ID</th>
                    <th className="text-left p-3">Contact</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{p.name}</td>
                      <td className="p-3 font-mono">{p.id}</td>
                      <td className="p-3">{p.emailOrMobile}</td>
                      <td className="p-3">
                        <Link href={`/patients/${p.id}`} className="text-blue-600 hover:underline">View/Edit Records</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`.input-field{display:block;width:100%;padding:0.5rem;border-radius:0.375rem;border:1px solid #d1d5db;margin-top:0.25rem;}`}</style>
    </div>

  );
};

export default DoctorDashboardPage;