
import { useAuth as useAuthContext } from '@/context/AuthContext';

// This hook simply re-exports the context for easier use in components
const useAuth = () => {
  const context = useAuthContext();
  return context;
};

export default useAuth;