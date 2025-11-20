'use client';
import { useState } from "react";
import PatientCard from "@/components/PatientCard";
import PatientForm from "@/components/PatientForm";
import { usePatients } from "@/context/PatientContext";
import { Patient } from "@/types/patient";

const PatientsPage = () => {
  const { patients, loading, error, deletePatient } = usePatients();
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      await deletePatient(id);
    }
  };

  if (loading) return <p>Loading patients...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">Add New Patient</h1>
        <PatientForm />
      </div>
      <div>
        <h1 className="text-2xl font-bold mb-6">Existing Patients</h1>
        <div className="grid grid-cols-1 gap-4">
          {patients.length === 0 ? <p>No patients added yet.</p> : patients.map((patient) => (
            <PatientCard 
              key={patient.id} 
              patient={patient} 
              onDelete={handleDelete} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientsPage;