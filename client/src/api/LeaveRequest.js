import api from './axiosConfig';

export const createLeaveRequest = async (formData) => {
  const response = await api.post('/leaves/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', 
    },
  });
  return response.data;
};

export const getPendingLeaves = async () => {
  const response = await api.get('/manager/leaves/list/pending'); 
  return response.data;
};

export const processLeaveRequest = async (approvalData) => {
  const response = await api.post('/manager/leaves/process', approvalData);
  return response.data;
};

export const getLeaveRequestDetail = async (requestId) => {
  const response = await api.get(`/leaves/${requestId}`); 
  return response.data;
};

export const getLeaveRequestForUpdate = async (requestId) => {
  const response = await api.get(`/leaves/update/${requestId}`);
  return response.data;
};

export const updateLeaveRequest = async (requestId, formData) => {
  const response = await api.put(`/leaves/update/${requestId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data', 
    },
  });
  return response.data;
};

export const deleteLeaveRequest = async (requestId) => {
  const response = await api.delete(`/leaves/delete/${requestId}`);
  return response.data;
};



