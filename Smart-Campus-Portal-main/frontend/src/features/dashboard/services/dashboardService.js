import api from '../../../services/api';

export const getDashboardData = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};
