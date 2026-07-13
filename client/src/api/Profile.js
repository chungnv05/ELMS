import api from "./axiosConfig";

export const getMyProfile = async () => {
  const response = await api.get('/user/profile');
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.put('/user/change-password', passwordData);
  return response.data;
};