import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { PatientProvider } from "@/context/PatientContext";
import { AppointmentProvider } from "@/context/AppointmentContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Captimed Clinic",
  description: "Your partner in health management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <AuthProvider>
          <PatientProvider>
            <AppointmentProvider>
              <Navbar />
              <main className="flex-grow container mx-auto px-4 py-8">
                {children}
              </main>
              <Footer />
            </AppointmentProvider>
          </PatientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
