'use client';

import Link from 'next/link';

export default function DoctorLoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">Login Temporarily Disabled</h1>
        <p className="text-gray-600">
          You are automatically logged in for development.
        </p>
        <div className="pt-4">
          <Link href="/doctors/dashboard" className="font-medium text-indigo-600 hover:text-indigo-500">
            Go to Doctor Dashboard &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}