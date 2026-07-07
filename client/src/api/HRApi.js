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

export const importEmployeesExcel = async (file) => {
  const formData = new FormData();
  formData.append('file', file); 

  const response = await api.post('/hr/employees/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const createLeaveType = async (data) => {
  const response = await api.post('/hr/leave-types/create', data);
  return response.data;
};

export const toggleLeaveType = async (id) => {
  const response = await api.put(`/hr/leave-types/${id}/toggle`);
  return response.data;
};

export const getLeaveTypes = async () => {
  const response = await api.get('/hr/leave-types');
  return response.data;
};