import axiosInstance from '../axiosConfig';

const getChildren = (data: any) => {
  return axiosInstance.post('/api/AutismoChildren/GetAllAutismoChildren', data);
};

const getAllAutismoChildren = getChildren;

const deleteChild = (childId: string, userId: string) => {
  return axiosInstance.put(`/api/AutismoChildren/DeleteAutismoChild/${childId}/${userId}`);
};

const editChild = (child: any) => {
  return axiosInstance.post('/api/AutismoChildren/EditAutismoChild', child);
};

const getEvaluationsByChildId = (childId: string) => {
  return axiosInstance.get(`/api/AutismoChildren/GetEvaluationsByChildId/${childId}`);
};

const getEvaluationDetails = (evaluationId: string) => {
  return axiosInstance.get(`/api/AutismoChildren/GetEvaluationDetails/${evaluationId}`);
};

const registerWithEvaluation = (data: any) => {
  return axiosInstance.post('/api/AutismoChildren/RegisterWithEvaluation', data);
};

const getAutismoSummary = (data: any) => {
  return axiosInstance.post('/api/AutismoChildren/GetAutismoSummary', data);
};

const exportAutismoChildren = (data: { ipress: string[], startDate: string, endDate: string }) => {
  return axiosInstance.post(
    '/api/AutismoChildren/ExportAutismoChildren',
    data,
    { responseType: 'blob' }
  );
};

export default {
  getChildren,
  getAllAutismoChildren,
  getAutismoSummary,
  deleteChild,
  editChild,
  getEvaluationsByChildId,
  getEvaluationDetails,
  registerWithEvaluation,
  exportAutismoChildren,
}; 