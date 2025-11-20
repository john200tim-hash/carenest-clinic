export interface User {
  id: string;
  email: string;
  name?: string; // Optional for admin user
  role?: 'patient' | 'doctor' | 'admin'; // Optional for admin user
  // Add other user-related fields as needed (e.g., profile picture, address)
}
