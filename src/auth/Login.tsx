import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { ClipLoader } from 'react-spinners';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import sideImage from '../assets/Imagen_login.png';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.clear();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/AutismoAuth/login', { email, password });
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('userId', response.data.identifier);
      sessionStorage.setItem('user', response.data.user);
      sessionStorage.setItem('role', response.data.role);
      sessionStorage.setItem('ipress', response.data.ipress);
      sessionStorage.setItem('dni', response.data.dni);
      setLoading(false);
      navigate('/dashboard');
    } catch (error: any) {
      setLoading(false);
      if (error.response?.status === 403) {
        toast.error(error?.response?.data?.message);
      } else if (error.response?.status === 400) {
        toast.error(error?.response?.data?.message);
      } else {
        toast.error('Ocurrió un error. Por favor, intenta nuevamente.');
      }
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-custom-blue">
      {/* Sección de imagen (solo desktop) */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center">
        <img
          src={sideImage}
          alt="Login visual"
          className="max-h-[100vh] object-contain rounded-lg"
        />
      </div>

      {/* Sección del formulario - Modificado para centrado vertical en móvil */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 my-auto"> {/* Añadido my-auto */}
        <form onSubmit={handleLogin} className="bg-white p-6 md:p-10 rounded-lg shadow-lg w-full max-w-sm">
          <div className="mb-8 flex justify-center">
            <h1 className="text-3xl font-bold text-custom-blue mb-2 text-center">Iniciar Sesión</h1>
          </div>

          <div className="mb-6">
            <label className="block text-custom-blue text-sm font-bold mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              required
            />
          </div>

          <div className="mb-6 relative">
            <label className="block text-custom-blue text-sm font-bold mb-2">
              Contraseña
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              required
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-3 top-10 pt-7 transform -translate-y-1/2 focus:outline-none"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-custom-blue" />
              ) : (
                <EyeIcon className="h-5 w-5 text-custom-blue" />
              )}
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center mb-4">
              <ClipLoader color="#000000" size={24} />
            </div>
          ) : (
            <button
              type="submit"
              className="w-full bg-custom-blue text-white font-bold py-3 rounded-md transition duration-300 hover:bg-opacity-90"
            >
              Continuar
            </button>
          )}

          <p className="mt-4 text-center text-gray-600">
            ¿No tienes una cuenta?{' '}
            <a href="/register" className="text-custom-blue hover:underline">
              Regístrate
            </a>
          </p>
        </form>
      </div>

      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default Login;