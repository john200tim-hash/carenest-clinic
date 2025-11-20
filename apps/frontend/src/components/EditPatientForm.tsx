'use client';

import React, { useState, useEffect } from 'react';
import { Patient } from '@/types/patient';
import { usePatients } from '@/context/PatientContext';

interface Props {
  patient: Patient;
  onClose: () => void;
}

const EditPatientForm = ({ patient, onClose }: Props) => {
  const { updatePatient } = usePatients();
  const [formData, setFormData] = useState<Patient>(patient);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData(patient);
  }, [patient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await updatePatient(formData);
      onClose(); // Close the modal on success
    } catch (err: any) {
      setError(err.message || 'Failed to update patient.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">Edit Patient Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 bg-red-100 p-2 rounded-md">{error}</p>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input name="name" value={formData.name} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input type="date" name="dateOfBirth" value={new Date(formData.dateOfBirth).toISOString().slice(0, 10)} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="input-field">
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email or Mobile</label>
              <input name="emailOrMobile" value={formData.emailOrMobile} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Number</label>
              <input name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input name="address" value={formData.address} onChange={handleChange} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Medical History</label>
            <textarea name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} className="input-field" rows={3} />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
      <style jsx>{`.input-field{display:block;width:100%;padding:0.5rem;border-radius:0.375rem;border:1px solid #d1d5db;margin-top:0.25rem;}`}</style>
    </div>
  );
};

export default EditPatientForm;