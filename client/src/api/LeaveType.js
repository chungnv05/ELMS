import api from "./axiosConfig";

export const getActiveLeaveTypes = async () => {
  const response = await api.get('/leaves/types/active');
  return response.data; 
};