'use client';
import React, { useState } from 'react';
import { Patient } from '@/types/patient';
import { usePatients } from '@/context/PatientContext';

const PatientForm = () => {
  const { addPatient } = usePatients();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Patient, 'id' | 'dateOfBirth'> & { dateOfBirth: Date }>({
    name: '',
    dateOfBirth: new Date(), // Default to current date
    gender: '',
    contactNumber: '',
    address: '',
    medicalHistory: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'dateOfBirth' ? new Date(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    addPatient(formData)
      .then(() => {
        setFormData({ // Reset form
          name: '',
          dateOfBirth: new Date(),
          gender: '',
          contactNumber: '',
          address: '',
          medicalHistory: '',
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-4">Add New Patient</h2>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
        <input
          type="date"
          id="dateOfBirth"
          name="dateOfBirth"
          value={formData.dateOfBirth.toISOString().split('T')[0]} // Format Date object for input type="date"
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Contact Number</label>
        <input type="text" id="contactNumber" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
        <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
      </div>
      <div>
        <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700">Medical History</label>
        <textarea id="medicalHistory" name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"></textarea>
      </div>
      <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50">{loading ? 'Adding...' : 'Add Patient'}</button>
    </form>
  );
};

export default PatientForm;