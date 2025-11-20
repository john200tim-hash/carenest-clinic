'use client';
import React, { useState } from 'react';
import { useAppointments } from '@/context/AppointmentContext';
import { Appointment } from '@/types/appointment';

const AppointmentForm = () => {
  const { addAppointment } = useAppointments();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Appointment, 'id' | 'status'>>({
    patientId: '',
    doctorId: '',
    date: new Date(),
    time: '',
    reason: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'date' ? new Date(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addAppointment({ ...formData, status: 'scheduled' });
      // Reset form
      setFormData({
        patientId: '',
        doctorId: '',
        date: new Date(),
        time: '',
        reason: '',
      });
    } catch (error) {
      console.error("Failed to add appointment", error);
      // Optionally, show an error message to the user
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-4">Schedule New Appointment</h2>
      <div>
        <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">Patient ID</label>
        <input type="text" id="patientId" name="patientId" value={formData.patientId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
      </div>
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
        <input type="date" id="date" name="date" value={formData.date.toISOString().split('T')[0]} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
      </div>
      <div>
        <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time</label>
        <input type="time" id="time" name="time" value={formData.time} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
      </div>
      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason for Visit</label>
        <textarea id="reason" name="reason" value={formData.reason} onChange={handleChange} rows={3} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"></textarea>
      </div>
      <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50">
        {loading ? 'Scheduling...' : 'Schedule Appointment'}
      </button>
    </form>
  );
};

export default AppointmentForm;
