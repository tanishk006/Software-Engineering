import api from '../../../services/api';

export const getLostItems = async (params = {}) => {
  const response = await api.get('/lost-items', { params });
  return response.data;
};

export const getLostItemById = async (id) => {
  const response = await api.get(`/lost-items/${id}`);
  return response.data;
};

export const reportLostItem = async (formData) => {
  const response = await api.post('/lost-items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateLostStatus = async (id, status) => {
  const response = await api.patch(`/lost-items/${id}/status`, { status });
  return response.data;
};

export const deleteLostItem = async (id) => {
  const response = await api.delete(`/lost-items/${id}`);
  return response.data;
};

export const getFoundItems = async (params = {}) => {
  const response = await api.get('/found-items', { params });
  return response.data;
};

export const getFoundItemById = async (id) => {
  const response = await api.get(`/found-items/${id}`);
  return response.data;
};

export const reportFoundItem = async (formData) => {
  const response = await api.post('/found-items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateFoundStatus = async (id, status, claimedByName = null) => {
  const response = await api.patch(`/found-items/${id}/status`, { status, claimedByName });
  return response.data;
};

export const deleteFoundItem = async (id) => {
  const response = await api.delete(`/found-items/${id}`);
  return response.data;
};
