'use client';

import React, { useState, FormEvent } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formState, setFormState] = useState<any>({});

  const titleMap = {
    symptoms: 'Symptoms',
    diagnoses: 'Diagnoses',
    prescriptions: 'Prescriptions',
    bills: 'Bills',
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Add the current date to the data being submitted
      const dataToSubmit = { ...formState, date: new Date().toISOString() };
      await addMedicalInfo(patient.id, infoType, dataToSubmit);
      setFormState({}); // Reset form after successful submission
    } catch (error) {
      console.error(`Failed to add ${infoType}:`, error);
      setError(`Failed to add ${infoType}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const renderFormFields = () => {
    switch (infoType) {
      case 'symptoms':
        return (
          <>
            <input name="description" placeholder="Description" onChange={handleInputChange} value={formState.description || ''} className="input-field" required />
            <input name="severity" placeholder="Severity (e.g., Mild, Moderate, Severe)" onChange={handleInputChange} value={formState.severity || ''} className="input-field" required />
          </>
        );
      case 'diagnoses':
        return (
          <>
            <input name="condition" placeholder="Condition" onChange={handleInputChange} value={formState.condition || ''} className="input-field" required />
            <textarea name="notes" placeholder="Notes" onChange={handleInputChange} value={formState.notes || ''} className="input-field" />
          </>
        );
      case 'prescriptions':
        return (
          <>
            <input name="medication" placeholder="Medication" onChange={handleInputChange} value={formState.medication || ''} className="input-field" required />
            <input name="dosage" placeholder="Dosage" onChange={handleInputChange} value={formState.dosage || ''} className="input-field" required />
            <input name="startDate" type="date" onChange={handleInputChange} value={formState.startDate || ''} className="input-field" required />
            <input name="endDate" type="date" onChange={handleInputChange} value={formState.endDate || ''} className="input-field" />
          </>
        );
      case 'bills':
        return (
          <>
            <input name="description" placeholder="Service Description" onChange={handleInputChange} value={formState.description || ''} className="input-field" required />
            <input name="amount" type="number" placeholder="Amount" onChange={handleInputChange} value={formState.amount || ''} className="input-field" required />
            <select name="status" onChange={handleInputChange} value={formState.status || 'Unpaid'} className="input-field" required>
              <option value="Unpaid">Unpaid</option>
              <option value="Paid">Paid</option>
            </select>
          </>
        );
      default:
        return null;
    }
  };

  const renderListItem = (item: any, index: number) => {
    switch (infoType) {
      case 'symptoms':
        return <li key={index}><strong>{formatDate(new Date(item.date))}:</strong> {item.description} (Severity: {item.severity})</li>;
      case 'diagnoses':
        return <li key={index}><strong>{formatDate(new Date(item.date))}:</strong> {item.condition} - <em>Notes: {item.notes}</em></li>;
      case 'prescriptions':
        return <li key={index}><strong>{formatDate(new Date(item.startDate))} to {formatDate(new Date(item.endDate))}:</strong> {item.medication} ({item.dosage})</li>;
      case 'bills':
        return <li key={index}><strong>{formatDate(new Date(item.date))}:</strong> {item.description} - ${item.amount.toFixed(2)} <span className={`font-semibold ${item.status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>({item.status})</span></li>;
      default:
        return null;
    }
  }

  return (
    <div className="p-6 border rounded-lg shadow-md bg-white">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">{titleMap[infoType]}</h2>
      
      {/* List of existing items */}
      <div className="mb-6 space-y-2">
        {(patient[infoType] && patient[infoType]!.length > 0) ? (
          <ul className="list-disc list-inside">
            {patient[infoType]!.map(renderListItem)}
          </ul>
        ) : (
          <p className="text-gray-500">No {titleMap[infoType].toLowerCase()} recorded yet.</p>
        )}
      </div>

      {/* Dynamic Form to add a new item */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <h3 className="font-semibold">Add New {titleMap[infoType].slice(0, -1)}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderFormFields()}
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>
      <style jsx>{`
        .input-field {
          display: block;
          width: 100%;
          padding: 0.5rem;
          border-radius: 0.375rem;
          border: 1px solid #d1d5db;
        }
      `}</style>
    </div>
  );
};

export default MedicalInfoManager;