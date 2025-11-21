--- a/c:/Users/CLAIRVOIYANT/Desktop/captimed-clinic/apps/frontend/src/app/view-records/page.tsx
+++ b/c:/Users/CLAIRVOIYANT/Desktop/captimed-clinic/apps/frontend/src/app/view-records/page.tsx
@@ -3,11 +3,16 @@
 
 import { useState } from 'react';
 import { useRouter } from 'next/navigation';
+import { usePatients } from '@/context/PatientContext';
 
 const ViewRecordsPage = () => {
   const [patientId, setPatientId] = useState('');
   const [error, setError] = useState('');
   const router = useRouter();
+  const { patients } = usePatients();
+
+  // For now, just pick the first patient in the list
+  const defaultPatientId = patients.length > 0 ? patients[0].id : null;
 
   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
@@ -17,7 +22,12 @@
       return;
     }
     // Redirect to the dynamic appointment status page
-    router.push(`/appointment-status/${patientId.trim()}`);
+    router.push(`/appointment-status/${patientId}`);
+  };
+
+  const handleBypass = () => {
+    // If there's a default patient, navigate to their record
+    if (defaultPatientId) router.push(`/appointment-status/${defaultPatientId}`);
   };
 
   return (
@@ -26,7 +36,7 @@
         <h1 className="text-3xl font-bold mb-4 text-center">View Your Medical Records</h1>
         <p className="text-gray-600 mb-6 text-center">
           Please enter your Patient ID to securely access your information. You can find this ID on any document provided by the clinic.
-        </p>
+        </p> 
         <form onSubmit={handleSubmit} className="space-y-4">
           {error && <p className="text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>}
           
@@ -42,6 +42,11 @@
           <button type="submit" className="w-full px-4 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700">
             View Records
           </button>
+          {/* Add a bypass button for development */}
+          {defaultPatientId && (
+            <button type="button" onClick={handleBypass} className="w-full px-4 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700">
+              Bypass and View First Patient's Records
+            </button>
         </form>
       </div>
     </div>

