  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (adminUser?.token) {
      headers['Authorization'] = `Bearer ${adminUser.token}`;
    }
    return headers;
  };

  const fetchPatients = async () => {

/*************  ✨ Windsurf Command ⭐  *************/
/*******  1849b58d-a8c9-4eb5-b861-968e5cc8c49e  *******//**

 * Returns the current state of the PatientContext.

 * Should be used within a PatientProvider.

 * @returns {PatientContextType} The current state of the PatientContext.

 */
