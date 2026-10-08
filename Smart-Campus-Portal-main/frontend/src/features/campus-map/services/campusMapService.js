import api from '../../../services/api';

export const getCampusLocations = async (params = {}) => {
  const response = await api.get('/campus-map', { params });
  return response.data;
};

export const createCampusLocation = async (payload) => {
  const response = await api.post('/campus-map', payload);
  return response.data;
};

export const updateCampusLocation = async (id, payload) => {
  const response = await api.put(`/campus-map/${id}`, payload);
  return response.data;
};

export const deleteCampusLocation = async (id) => {
  const response = await api.delete(`/campus-map/${id}`);
  return response.data;
};
