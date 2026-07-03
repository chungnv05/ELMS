import api from "./axiosConfig"; // Đảm bảo đường dẫn này đúng với file axiosConfig của bạn


export const getCompanyStats = async () => {
  const response = await api.get('/hr/stats');
  return response.data;
};