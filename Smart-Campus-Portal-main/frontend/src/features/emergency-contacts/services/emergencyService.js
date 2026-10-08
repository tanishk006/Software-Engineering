import api from '../../../services/api';

export const getEmergencyContacts = async (params = {}) => {
  const response = await api.get('/emergency-contacts', { params });
  return response.data;
};

export const createEmergencyContact = async (payload) => {
  const response = await api.post('/emergency-contacts', payload);
  return response.data;
};

export const updateEmergencyContact = async (id, payload) => {
  const response = await api.put(`/emergency-contacts/${id}`, payload);
  return response.data;
};

export const deleteEmergencyContact = async (id) => {
  const response = await api.delete(`/emergency-contacts/${id}`);
  return response.data;
};
