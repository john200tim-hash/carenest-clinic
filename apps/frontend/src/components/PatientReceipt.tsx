'use client';

import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Patient } from '@/types/patient';
import { formatDate } from '@/lib/formatDate';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
  lastAutoTable: { finalY: number };
}

const PatientReceipt = ({ patient }: { patient: Patient }) => {
  const {
    name,
    id,
    gender,
    dateOfBirth,
    emailOrMobile,
    contactNumber,
    address,
    medicalHistory,
    symptoms = [],
    diagnoses = [],
    prescriptions = [],
    bills = [],
  } = patient;

  const downloadPDF = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    doc.setFontSize(18);
    doc.text('Patient Visit Receipt', 14, 22);
    doc.setFontSize(11);
    doc.text(`Name: ${name}`, 14, 32);
    doc.text(`Patient ID: ${id}`, 14, 39);
    doc.text(`Gender: ${gender}`, 14, 46);
    doc.text(`Date of Birth: ${formatDate(dateOfBirth)}`, 14, 53);
    doc.text(`Contact: ${contactNumber}`, 14, 60);

    const addTable = (title: string, headers: string[], rows: any[][], startY: number) => {
      doc.setFontSize(14);
      doc.text(title, 14, startY);
      doc.autoTable({
        startY: startY + 5,
        head: [headers],
        body: rows,
        theme: 'grid',
        styles: { fontSize: 10 },
      });
      return doc.lastAutoTable.finalY;
    };

    let currentY = 70;

    if (symptoms.length) {
      currentY = addTable(
        'Symptoms',
        ['Date', 'Description', 'Severity'],
        symptoms.map((s) => [formatDate(s.date), s.description, s.severity]),
        currentY
      ) + 10;
    }

    if (diagnoses.length) {
      currentY = addTable(
        'Diagnoses',
        ['Date', 'Condition', 'Notes'],
        diagnoses.map((d) => [formatDate(d.date), d.condition, d.notes]),
        currentY
      ) + 10;
    }

    if (prescriptions.length) {
      currentY = addTable(
        'Prescriptions',
        ['Medication', 'Dosage', 'Start Date', 'End Date'],
        prescriptions.map((p) => [
          p.medication,
          p.dosage,
          formatDate(p.startDate),
          formatDate(p.endDate),
        ]),
        currentY
      ) + 10;
    }

    if (bills.length) {
      addTable(
        'Billing',
        ['Date', 'Description', 'Amount', 'Status'],
        bills.map((b) => [
          formatDate(b.date),
          b.description,
          `$${b.amount.toFixed(2)}`,
          b.status,
        ]),
        currentY
      );
    }

    doc.save(`${name.replace(/\s+/g, '_')}_Receipt.pdf`);
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-700">Full Medical Record</h3>
        <button onClick={downloadPDF} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
          Download as PDF
        </button>
      </div>
      <RecordSection title="Symptoms" items={symptoms} render={item => `${formatDate(new Date(item.date))}: ${item.description} (${item.severity})`} />
      <RecordSection title="Diagnoses" items={diagnoses} render={item => `${formatDate(new Date(item.date))}: ${item.condition} - Notes: ${item.notes}`} />
      <RecordSection title="Prescriptions" items={prescriptions} render={item => `${formatDate(new Date(item.startDate))}: ${item.medication} (${item.dosage})`} />
      <RecordSection title="Bills" items={bills} render={item => `${formatDate(new Date(item.date))}: ${item.description} - $${item.amount.toFixed(2)} (${item.status})`} />
    </div>
  );
};

const RecordSection = ({ title, items, render }: { title: string, items: any[] | undefined, render: (item: any) => string }) => (
  <div className="mb-4">
    <h4 className="text-lg font-semibold mb-2 text-gray-600 border-b pb-1">{title}</h4>
    {items && items.length > 0 ? (
      <ul className="list-disc list-inside space-y-1 text-gray-600">
        {items.map((item, index) => <li key={index}>{render(item)}</li>)}
      </ul>
    ) : (
      <p className="text-gray-500">No {title.toLowerCase()} recorded.</p>
    )}
  </div>
);

export default PatientReceipt;