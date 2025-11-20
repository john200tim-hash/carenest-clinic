'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Patient } from '@/types/patient';

const RequestAppointmentPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    emailOrMobile: '',
    date: '',
    time: '',
    reason: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Ensure the API_BASE_URL is correctly retrieved from environment variables
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_BASE_URL}/api/appointments/request`, {
        method: 'POST', // Explicitly define the method as POST
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        // Attempt to parse error JSON, with a fallback for non-JSON responses
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
        throw new Error(errorData.message || 'Failed to submit request.');
      }

      const patient: Patient = await response.json(); // The backend now returns the patient object

      // Store name for the status page and redirect
      localStorage.setItem('newPatientName', patient.name);
      router.push(`/appointment-status/${patient.id}`);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Request an Appointment</h1>
      <form onSubmit={handleSubmit} className="space-y-4 p-6 border rounded-lg shadow-lg bg-white">
        {error && <p className="text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Your Full Name</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label htmlFor="emailOrMobile" className="block text-sm font-medium text-gray-700">Your Email or Mobile Number</label>
          <input type="text" id="emailOrMobile" name="emailOrMobile" value={formData.emailOrMobile} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Preferred Date</label>
          <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700">Preferred Time</label>
          <input type="time" id="time" name="time" value={formData.time} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason for Visit</label>
          <textarea id="reason" name="reason" value={formData.reason} onChange={handleChange} rows={4} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
        </div>
        <button type="submit" disabled={loading} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

export default RequestAppointmentPage;