'use client';

import React, { useState } from 'react';
import { Patient } from '@/types/patient';
import { usePatients } from '@/context/PatientContext';

const MedicalInfoManager = ({ patient }: { patient: Patient }) => {
  const { addMedicalInfo } = usePatients();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [symptoms, setSymptoms] = useState([{ description: '', date: '', severity: 'Mild' }]);
  const [diagnoses, setDiagnoses] = useState([{ condition: '', date: '', notes: '' }]);
  const [prescriptions, setPrescriptions] = useState([{ medication: '', dosage: '', startDate: '', endDate: '' }]);
  const [bills, setBills] = useState([{ item: '', bill: '', date: '', status: 'Unpaid' }]);

  const handleChange = (setter: any, index: number, field: string, value: any) => {
    setter((prev: any) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleAdd = (setter: any, template: any) => setter((prev: any) => [...prev, template]);

  const handleSubmit = async (e: React.FormEvent, infoType: string, data: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Filter out empty entries before submitting
      const cleanData = data.filter((item: any) => Object.values(item).some(val => val !== ''));
      if (cleanData.length === 0) {
        setError(`No new ${infoType} to add.`);
        setLoading(false);
        return;
      }

      // Submit each item individually
      for (const item of cleanData) {
        await addMedicalInfo(patient.id, infoType, item);
      }

      setSuccess(`${infoType} updated successfully!`);
      // Optionally reset the specific form section
      if (infoType === 'symptoms') setSymptoms([{ description: '', date: '', severity: 'Mild' }]);
      if (infoType === 'diagnoses') setDiagnoses([{ condition: '', date: '', notes: '' }]);
      if (infoType === 'prescriptions') setPrescriptions([{ medication: '', dosage: '', startDate: '', endDate: '' }]);
      if (infoType === 'bills') setBills([{ item: '', bill: '', date: '', status: 'Unpaid' }]);

    } catch (err: any) {
      setError(err.message || `Failed to update ${infoType}.`);
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (title: string, items: any[], setter: any, template: any, fields: any[]) => (
    <form onSubmit={(e) => handleSubmit(e, title.toLowerCase(), items)} className="p-6 border rounded-lg shadow-md bg-white mb-8">
      <h3 className="text-2xl font-semibold mb-4 text-gray-700">{title}</h3>
      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end">
          {fields.map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-600">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  name={field.name}
                  value={item[field.name]}
                  onChange={(e) => handleChange(setter, index, field.name, e.target.value)}
                  className="input-field"
                >
                  {field.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  placeholder={field.label}
                  value={item[field.name]}
                  onChange={(e) => handleChange(setter, index, field.name, e.target.value)}
                  className="input-field"
                />
              )}
            </div>
          ))}
        </div>
      ))}
      <div className="flex justify-between items-center mt-4">
        <button type="button" onClick={() => handleAdd(setter, template)} className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
          + Add Row
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Saving...' : `Save ${title}`}
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-8">
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
      {success && <p className="text-green-500 bg-green-100 p-3 rounded-md">{success}</p>}

      {renderSection('Symptoms', symptoms, setSymptoms, { description: '', date: '', severity: 'Mild' }, [
        { name: 'description', label: 'Description', type: 'text' },
        { name: 'date', label: 'Date', type: 'date' },
        { name: 'severity', label: 'Severity', type: 'select', options: ['Mild', 'Moderate', 'Severe'] },
      ])}

      {renderSection('Diagnoses', diagnoses, setDiagnoses, { condition: '', date: '', notes: '' }, [
        { name: 'condition', label: 'Condition', type: 'text' },
        { name: 'date', label: 'Date', type: 'date' },
        { name: 'notes', label: 'Notes', type: 'text' },
      ])}

      {renderSection('Prescriptions', prescriptions, setPrescriptions, { medication: '', dosage: '', startDate: '', endDate: '' }, [
        { name: 'medication', label: 'Medication', type: 'text' },
        { name: 'dosage', label: 'Dosage', type: 'text' },
        { name: 'startDate', label: 'Start Date', type: 'date' },
        { name: 'endDate', label: 'End Date', type: 'date' },
      ])}

      {renderSection('Bills', bills, setBills, { item: '', bill: '', date: '', status: 'Unpaid' }, [
        { name: 'item', label: 'Service/Item', type: 'text' },
        { name: 'bill', label: 'Bill Amount', type: 'number' },
        { name: 'date', label: 'Date', type: 'date' },
        { name: 'status', label: 'Status', type: 'select', options: ['Unpaid', 'Paid'] },
      ])}
      
      <style jsx>{`
        .input-field {
          display: block;
          width: 100%;
          padding: 0.5rem;
          border-radius: 0.375rem;
          border: 1px solid #d1d5db;
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
};

export default MedicalInfoManager;

/* This is a placeholder for the old MedicalInfoManager, we will replace its usage */
interface MedicalInfoManagerProps {
  patient: Patient;
  infoType: 'symptoms' | 'diagnoses' | 'prescriptions' | 'bills';
}