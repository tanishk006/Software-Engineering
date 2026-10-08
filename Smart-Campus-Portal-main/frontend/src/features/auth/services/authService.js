import api from '../../../services/api';

export const loginWithPassword = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const loginWithGoogle = async (credential) => {
  const response = await api.post('/auth/google', { credential });
  return response.data;
};

export const registerUser = async (payload) => {
  const response = await api.post('/auth/register', payload);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfile = async (formData) => {
  const response = await api.put('/auth/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const logoutUser = async () => {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    // Stateless logout succeeds locally regardless of network error
  }
};