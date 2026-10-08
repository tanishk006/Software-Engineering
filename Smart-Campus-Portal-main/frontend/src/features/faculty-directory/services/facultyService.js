import api from '../../../services/api';

export const getFacultyList = async (params = {}) => {
  const response = await api.get('/faculty', { params });
  return response.data;
};

export const getFacultyById = async (id) => {
  const response = await api.get(`/faculty/${id}`);
  return response.data;
};

export const getDepartments = async () => {
  const response = await api.get('/departments');
  return response.data;
};

export const createFaculty = async (payload) => {
  const response = await api.post('/faculty', payload);
  return response.data;
};

export const updateFaculty = async (id, payload) => {
  const response = await api.put(`/faculty/${id}`, payload);
  return response.data;
};

export const deleteFaculty = async (id) => {
  const response = await api.delete(`/faculty/${id}`);
  return response.data;
};
