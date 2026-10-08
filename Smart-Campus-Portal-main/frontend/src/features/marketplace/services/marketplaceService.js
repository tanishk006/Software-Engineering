import api from '../../../services/api';

export const getMarketplaceItems = async (params = {}) => {
  const response = await api.get('/marketplace', { params });
  return response.data;
};

export const getMarketplaceItemById = async (id) => {
  const response = await api.get(`/marketplace/${id}`);
  return response.data;
};

export const createMarketplaceItem = async (formData) => {
  const response = await api.post('/marketplace', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateMarketplaceItem = async (id, formData) => {
  const response = await api.put(`/marketplace/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateMarketplaceStatus = async (id, status) => {
  const response = await api.patch(`/marketplace/${id}/status`, { status });
  return response.data;
};

export const deleteMarketplaceItem = async (id) => {
  const response = await api.delete(`/marketplace/${id}`);
  return response.data;
};
