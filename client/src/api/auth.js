import api from './axiosConfig';

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
};

export const getUserProfile = async () => {
  const response = await api.get('/auth/user/profile'); 
  return response.data;
};