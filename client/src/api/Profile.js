import api from "./axiosConfig";

export const getMyProfile = async () => {
  const response = await api.get('/profile');
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.put('/profile/change-password', passwordData);
  return response.data;
};