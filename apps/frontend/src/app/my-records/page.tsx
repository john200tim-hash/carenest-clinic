'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const MyRecordsPage = () => {
  const [patientId, setPatientId] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientId.trim()) {
      router.push(`/patients/${patientId.trim()}`);
    }
  };

  return (
    <div className="max-w-md mx-auto text-center">
      <h1 className="text-3xl font-bold mb-6">View Your Medical Records</h1>
      <p className="text-gray-600 mb-6">
        Please enter your Patient ID to securely access your information. You can find this ID on any document provided by the clinic.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          placeholder="Enter your Patient ID"
          className="flex-grow mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          View Records
        </button>
      </form>
    </div>
  );
};

export default MyRecordsPage;