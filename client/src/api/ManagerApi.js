import api from "./axiosConfig";

export const getManagerDashboardStats = async () => {
  const response = await api.get('/manager/department/stats');
  return response.data;
};

export const getTeamCalendar = async (year, month) => {
  const response = await api.get(`/manager/team/calendar?year=${year}&month=${month}`);
  return response.data;
};

export const getDepartmentEmployees = async () => {
  const response = await api.get('/manager/department/employees')
  return response.data;
}