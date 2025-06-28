// src/axiosConfig.ts
import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';

const instance = axios.create({
  //baseURL: 'https://matapp.somee.com/', 
  baseURL: 'https://localhost:7201/',
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token'); // Obteniendo el token desde sessionStorage
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Agregando el token al encabezado de autorización
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const code = error.code; 
    console.error("Error no manejado:", error);
    if (status === 401) {
      alert("La sesión ha expirado, vuelva a ingresar a la plataforma.");
      window.location.href = '/login';
    }
    else if(code === "ERR_NETWORK"){
      alert("Plataforma en mantenimiento.");
      window.location.href = '/login';
    }
    else {
      console.error("Error no manejado:", error);
    }

    return Promise.reject(error);
  }
);

export default instance;
