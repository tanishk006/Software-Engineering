import api from '../../../services/api';

export const getEvents = async (params = {}) => {
  const response = await api.get('/events', { params });
  return response.data;
};

export const getEventById = async (id) => {
  const response = await api.get(`/events/${id}`);
  return response.data;
};

export const createEvent = async (formData) => {
  const response = await api.post('/events', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateEvent = async (id, formData) => {
  const response = await api.put(`/events/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteEvent = async (id) => {
  const response = await api.delete(`/events/${id}`);
  return response.data;
};

export const rsvpEvent = async (id) => {
  const response = await api.post(`/events/${id}/register`);
  return response.data;
};

export const cancelRsvpEvent = async (id) => {
  const response = await api.delete(`/events/${id}/register`);
  return response.data;
};
