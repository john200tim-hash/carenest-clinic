import Link from 'next/link';

const Home = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4 text-gray-800">Captimed Clinic Portal</h1>
      <p className="text-xl text-gray-600 mb-12">
        Please select your module to continue.
      </p>
      <div className="flex justify-center gap-8">
        {/* Patient Module */}
        <div className="w-1/3 p-8 border rounded-lg shadow-lg bg-white">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">Patient Module</h2>
          <p className="text-gray-600 mb-6">Book a new appointment or view your existing treatment history using your Patient ID.</p>
          <div className="flex flex-col items-center gap-4">
            <Link href="/request-appointment" className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">
              Book Appointment
            </Link>
            <Link href="/my-records" className="w-full text-center bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg">
              View My Records
            </Link>
          </div>
        </div>
        {/* Doctor Module */}
        <div className="w-1/3 p-8 border rounded-lg shadow-lg bg-white">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Doctor Module</h2>
          <p className="text-gray-600 mb-6">Register or log in to access patient data.</p>
          <Link href="/doctors/login" className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg">
            Doctor Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;