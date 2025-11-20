'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const { doctorUser, logoutDoctor } = useAuth(); // Use doctorUser
  const router = useRouter();

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-700"> 
          Captimed Clinic
        </Link>
        <div className="space-x-6 flex items-center">
          {/* Public Links */}
          <Link href="/view-records" className="text-gray-600 hover:text-blue-600">
            Patient Records
          </Link>

          {/* Doctor-Only Links */}
          {doctorUser ? ( // Use doctorUser
            <>
              {/* Links for logged-in doctors */}
              <Link href="/appointments" className="text-gray-600 hover:text-blue-600 mr-4">
                Appointments
              </Link>
              <Link href="/patients" className="text-gray-600 hover:text-blue-600">
                Patients
              </Link>
              <button
                onClick={logoutDoctor}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : null}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
