import { Patient } from '@/types/patient';
import { formatDate } from '@/lib/formatDate';
import Link from 'next/link';

interface PatientCardProps {
  patient: Patient;
  onDelete: (id: string) => void;
}

const PatientCard = ({ patient, onDelete }: PatientCardProps) => {
  return (
    <div className="border rounded-md p-4 shadow-sm bg-white">
      <h3 className="text-lg font-semibold text-blue-700">{patient.name}</h3>
      <p className="text-sm text-gray-600"><strong>DOB:</strong> {formatDate(patient.dateOfBirth)}</p>
      <p className="text-sm text-gray-600"><strong>Gender:</strong> {patient.gender}</p>
      <p className="text-sm text-gray-600"><strong>Contact:</strong> {patient.contactNumber}</p>
      <p className="text-sm text-gray-600"><strong>Address:</strong> {patient.address}</p>
      <p className="text-sm text-gray-600"><strong>Medical History:</strong> {patient.medicalHistory || 'N/A'}</p>
      <div className="mt-4 flex space-x-2">
        <Link href={`/patients/${patient.id}`} className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
          View Details
        </Link>
        <button onClick={() => onDelete(patient.id)} className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">
          Delete
        </button>
      </div>
    </div>
  );
};

export default PatientCard;
