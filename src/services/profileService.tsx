import axiosInstance from '../axiosConfig';

const getProfile = (userId: string) => {
  return axiosInstance.get(`/api/AutismoUsers/GetUserById/${userId}`);
};

const updateProfile = (data: any) => {
  return axiosInstance.put('/api/AutismoUsers/UpdateUserById', data);
};

const updatePassword = (userId: string, password: string) => {
  return axiosInstance.put(`/api/AutismoUsers/UpdatePasswordById/${userId}?password=${password}`);
};

export default {
  getProfile,
  updateProfile,
  updatePassword,
};
