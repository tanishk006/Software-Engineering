import api from '../../../services/api';

export const getComplaints = async (params = {}) => {
  const response = await api.get('/complaints', { params });
  return response.data;
};

export const getComplaintById = async (id) => {
  const response = await api.get(`/complaints/${id}`);
  return response.data;
};

export const submitComplaint = async (formData) => {
  const response = await api.post('/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const assignComplaint = async (id, assignedTo, remarks) => {
  const response = await api.patch(`/complaints/${id}/assign`, { assignedTo, remarks });
  return response.data;
};

export const updateComplaintStatus = async (id, status, remarks) => {
  const response = await api.patch(`/complaints/${id}/status`, { status, remarks });
  return response.data;
};

export const deleteComplaint = async (id) => {
  const response = await api.delete(`/complaints/${id}`);
  return response.data;
};

export const getStaffList = async () => {
  const response = await api.get('/complaints/staff-list');
  return response.data;
};
