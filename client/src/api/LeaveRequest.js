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



