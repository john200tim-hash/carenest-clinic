'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container mx-auto mt-10 p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800">Welcome to Captimed Clinic</h1>
        <p className="text-lg text-gray-600 mt-2">Your central hub for patient and doctor services.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Patient Module */}
        <div className="p-8 border rounded-lg shadow-lg bg-white">
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">For Patients</h2>
          <div className="space-y-4">
            <Link href="/request-appointment" className="block w-full text-center px-4 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700">
              Request an Appointment
            </Link>
            <Link href="/view-records" className="block w-full text-center px-4 py-3 bg-gray-600 text-white font-bold rounded-md hover:bg-gray-700">
              View My Medical Records
            </Link>
          </div>
        </div>

        {/* Doctor Module */}
        <div className="p-8 border rounded-lg shadow-lg bg-white">
          <h2 className="text-2xl font-bold mb-4 text-center text-green-700">For Doctors</h2>
          <div className="space-y-4 mt-6">
            <Link href="/doctors/login" className="block w-full text-center px-4 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700">
              Doctor Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}