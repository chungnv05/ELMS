import api from "./axiosConfig";


export const getHLMStats = async () => {
  const response = await api.get('/hlm/stats');
  return response.data;
};

export const getPendingApprovals = async () => {
  const response = await api.get('/hlm/pending-approvals');
  return response.data; 
};

export const approveDepartment = async (id, isApproved) => {
  const response = await api.put(`/hlm/departments/${id}/approve`, null, {
    params: { isApproved }
  });
  return response.data;
};

export const approveLeaveType = async (id, isApproved) => {
  const response = await api.put(`/hlm/leave-types/${id}/approve`, null, {
    params: { isApproved }
  });
  return response.data;
};

export const getLeaveRequestForHLM = async () => {
  const response = await api.get('/hlm/leave-requests');
  return response.data;
};