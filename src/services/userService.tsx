import axiosInstance from '../axiosConfig'; 

const getUsers = (data: {
  pageNumber: number,
  pageSize: number,
  sortColumn: string,
  sortDirection: 'asc' | 'desc',
  filters?: Partial<{
    name: string;
    firstLastName: string;
    secondLastName: string;
    email: string;
    prefix: string;
    phone: string;
    isApproved: boolean | string;
  }>
}) => {
  const payload = {
    pageNumber: data.pageNumber,
    pageSize: data.pageSize,
    sortColumn: data.sortColumn,
    sortDirection: data.sortDirection,
    ...(Object.keys(data.filters || {}).length > 0 && { filters: data.filters }),
  };

  return axiosInstance.post('/api/AutismoUsers/GetAllUsers', payload);
};



const editUser = (selectedUser:any) => {
  return axiosInstance.post('/api/AutismoUsers/EditUser', selectedUser);
};

const removeUser = (id:string) => {
  return axiosInstance.delete(`/api/AutismoUsers/RemoveUser/${id}`);
};

const getUserById = (id:string) => {
  return axiosInstance.get(`/api/AutismoUsers/GetUserById/${id}`);
};

const updateUserById = (data:any) => {
  return axiosInstance.put('/api/AutismoUsers/UpdateUserById', data);
};

const updatePasswordById = (id:string, password:string) => {
  return axiosInstance.put(`/api/AutismoUsers/UpdatePasswordById/${id}?password=${password}`);
}
export default {
  getUsers,
  editUser,
  removeUser,
  getUserById,
  updateUserById,
  updatePasswordById
};