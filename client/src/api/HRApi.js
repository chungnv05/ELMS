import api from "./axiosConfig"; 


export const getCompanyStats = async () => {
  const response = await api.get('/hr/stats');
  return response.data;
};

export const getEmployees = async () => {
  const response = await api.get('/hr/employees');
  return response.data;
};

export const createEmployee = async (employeeData) => {
  const response = await api.post('/hr/create', employeeData);
  return response.data;
};

export const toggleEmployeeStatus = async (empId) => {
  const response = await api.put(`/hr/employees/${empId}/toggle-status`);
  return response.data;
};

export const getDepartments = async () => {
  const response = await api.get('hr/departments');
  return response.data;
};