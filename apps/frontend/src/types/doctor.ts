export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  // Add other doctor-related fields (e.g., availability, qualifications)
  profilePicture?: string; //Optional profile picture URL
}
