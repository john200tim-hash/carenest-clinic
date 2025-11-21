'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Patient } from '@/types/patient';

const PatientsListPage = () => {
  const { doctorUser } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchPatients = async () => {
      if (!doctorUser?.token) return;

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/patients`, {
          headers: { 'Authorization': `Bearer ${doctorUser.token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch patients.');
        const data = await response.json();
        setPatients(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [doctorUser]);

  if (loading) return <p className="text-center mt-10">Loading patients...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">All Patients</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {patients.map(patient => (
            <li key={patient.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold text-gray-800">{patient.name}</p>
                <p className="text-sm text-gray-500 font-mono">{patient.id}</p>
              </div>
              <Link href={`/patients/${patient.id}`} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                View Record
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PatientsListPage;