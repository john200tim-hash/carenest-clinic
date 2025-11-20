'use client';

import React, { useState } from 'react';
import { Patient } from '@/types/patient';
import { usePatients } from '@/context/PatientContext';
import { formatDate } from '@/lib/formatDate';

type InfoType = 'symptoms' | 'diagnoses' | 'prescriptions' | 'bills';

interface Props {
  patient: Patient;
  infoType: InfoType;
}

const MedicalInfoManager = ({ patient, infoType }: Props) => {
  const { addMedicalInfo } = usePatients();
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(false);

  const titleMap = {
    symptoms: 'Symptoms',
    diagnoses: 'Diagnoses',
    prescriptions: 'Prescriptions',
    bills: 'Bills',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    setLoading(true);
    try {
      // This is a simplified data structure. In a real app, you'd have more fields.
      const data = { description: newItem }; 
      await addMedicalInfo(patient.id, infoType, data);
      setNewItem('');
    } catch (error) {
      console.error(`Failed to add ${infoType}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = (item: any) => {
    // Simple rendering based on infoType. This can be expanded.
    switch (infoType) {
      case 'symptoms':
        return `${formatDate(new Date(item.dateReported))}: ${item.description} (${item.severity})`;
      case 'diagnoses':
        return `${formatDate(new Date(item.dateDiagnosed))}: ${item.condition}`;
      case 'prescriptions':
        return `${formatDate(new Date(item.datePrescribed))}: ${item.medication} - ${item.dosage}`;
      case 'bills':
        return `${formatDate(new Date(item.dateIssued))}: ${item.service} - $${item.amount} (${item.status})`;
      default:
        return JSON.stringify(item);
    }
  };

  return (
    <div className="p-6 border rounded-lg shadow-md bg-white">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">{titleMap[infoType]}</h2>
      
      {/* List of existing items */}
      <div className="mb-6 space-y-2">
        {(patient[infoType] && patient[infoType]!.length > 0) ? (
          <ul className="list-disc list-inside">
            {patient[infoType]!.map((item: any) => (
              <li key={item.id} className="text-gray-600">{renderItem(item)}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No {titleMap[infoType].toLowerCase()} recorded yet.</p>
        )}
      </div>

      {/* Form to add a new item */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={`Add new ${infoType.slice(0, -1)}...`}
          className="flex-grow mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </form>
    </div>
  );
};

export default MedicalInfoManager;