'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ViewRecordsPage = () => {
  const [patientId, setPatientId] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId.trim()) {
      setError('Patient ID cannot be empty.');
      return;
    }
    // Redirect to the dynamic appointment status page
    router.push(`/appointment-status/${patientId.trim()}`);
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div className="p-8 border rounded-lg shadow-lg bg-white">
        <h1 className="text-3xl font-bold mb-4 text-center">View Your Medical Records</h1>
        <p className="text-gray-600 mb-6 text-center">
          Please enter your Patient ID to securely access your information. You can find this ID on any document provided by the clinic.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>}
          
          <div>
            <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 sr-only">Enter your Patient ID</label>
            <input 
              type="text" 
              id="patientId" 
              name="patientId" 
              value={patientId} 
              onChange={(e) => setPatientId(e.target.value)} 
              placeholder="Enter your Patient ID"
              required 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-center p-3 text-lg" />
          </div>
          <button type="submit" className="w-full px-4 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700">
            View Records
          </button>
        </form>
      </div>
    </div>
  );
};

export default ViewRecordsPage;
