// Add your validation functions here (e.g., using Zod or Yup)
export const validateEmail = (email: string) => {
  // Basic email validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
