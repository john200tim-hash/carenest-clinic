--- a/c:/Users/CLAIRVOIYANT/Desktop/captimed-clinic/apps/frontend/src/types/appointment.ts
+++ b/c:/Users/CLAIRVOIYANT/Desktop/captimed-clinic/apps/frontend/src/types/appointment.ts
@@ -2,9 +2,10 @@
 
 export interface Appointment {
   id: string;
-  patientId: string;
+  patientId: string; 
+  patientName: string; // Add this property
   doctorId?: string;
   date: Date;
   time: string;
   reason: string;
-  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
+  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'; // Align with backend enum
   notes?: string; //Optional notes for the appointment
 }
