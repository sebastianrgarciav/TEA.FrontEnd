import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, XMarkIcon } from '@heroicons/react/24/solid';
import axiosInstance from '../axiosConfig';
import Swal from 'sweetalert2';

// Lista de IPRESS
const ipressList = [
  'HOSPITAL I JORGE VOTO BERNALES CORPANCHO',
  'HOSPITAL II CLINICA GERIATRICA SAN ISIDRO LABRADOR',
  'HOSPITAL II RAMON CASTILLA',
  'HOSPITAL II VITARTE',
  'HOSPITAL I AURELIO DIAZ UFANO Y PERAL',
  'HOSPITAL III EMERGENCIAS GRAU',
  'POLICLINICO CHOSICA',
  'POLICLINICO DE COMPLEJIDAD CRECIENTE SAN LUIS',
  'POLICLINICO FRANCISCO PIZARRO',
  'CAP III EL AGUSTINO',
  'CAP III ALFREDO PIAZZA ROBERTS',
  'CAP III HUAYCAN',
  'CAP III INDEPENDENCIA',
  'CAP III SAN BORJA',
  'CENTRO MEDICO ANCJIE',
  'CENTRO MEDICO CASAPALCA',
  'POSTA MEDICA CONSTRUCCION CIVIL',
  'RED PRESTACIONAL ALMENARA'
];

// Lista de roles
const rolesList = [
  'Administrador',
  'Colaborador',
  'Monitor'
];

const Register: React.FC = () => {
  // Información General
  const [dni, setDni] = useState('');
  const [name, setName] = useState('');
  const [firstLastName, setFirstLastName] = useState('');
  const [secondLastName, setSecondLastName] = useState('');

  // Permisos
  const [role, setRole] = useState('');
  const [ipress, setIpress] = useState<string[]>([]);
  const [filteredIpress, setFilteredIpress] = useState<string[]>(ipressList);
  const [ipressSearch, setIpressSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Credenciales
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrar IPRESS según búsqueda
  useEffect(() => {
    if (ipressSearch) {
      setFilteredIpress(
        ipressList.filter(center =>
          center.toLowerCase().includes(ipressSearch.toLowerCase())
        )
      );
    } else {
      setFilteredIpress(ipressList);
    }
  }, [ipressSearch]);

  // Resetear IPRESS cuando cambia el rol
  useEffect(() => {
    setIpress([]);
    setIpressSearch('');
  }, [role]);

  // Cierra el dropdown si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      Swal.fire({
        title: 'Error',
        text: 'Las contraseñas no coinciden',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Validar IPRESS según rol
    if (role === 'Colaborador' && ipress.length === 0) {
      Swal.fire({
        title: 'Error',
        text: 'Debe seleccionar al menos un IPRESS',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      const ipressString = role === 'Colaborador' 
        ? ipress.map(center => `${center}`).join('\n')
        : '';

      const response = await axiosInstance.post('/api/AutismoAuth/Register', {
        dni,
        name,
        FirstLastName: firstLastName,
        SecondLastName: secondLastName,
        role,
        ipress: ipressString,
        email,
        phone,
        password,
        IsApproved: false,
        IsDeleted: false
      });

      if (response.status === 200) {
        await Swal.fire({
          title: 'Registro exitoso',
          text: 'El registro fue realizado con éxito. Habla con el equipo para que te den acceso a la plataforma.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        navigate('/login');
      } else {
        Swal.fire({
          title: 'Error al registrar',
          text: 'El correo ya se encuentra registrado.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
      }
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        Swal.fire({
          title: 'Error de registro',
          text: error.response.data || 'Solicitud inválida.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: 'Ocurrió un error durante el registro. Por favor, inténtelo de nuevo más tarde.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const isFormValid = () => {
    const basicFieldsValid = (
      dni &&
      dni.length <= 10 &&
      name &&
      firstLastName &&
      secondLastName &&
      role &&
      email &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      password &&
      confirmPassword &&
      password === confirmPassword
    );

    if (role === 'Colaborador') {
      return basicFieldsValid && ipress.length > 0;
    }

    return basicFieldsValid;
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleIpress = (center: string) => {
    if (role === 'Colaborador') {
      if (ipress.includes(center)) {
        setIpress(ipress.filter(hc => hc !== center));
      } else {
        setIpress([...ipress, center]);
      }
    }
    setDropdownOpen(false);
  };

  // Manejador para actualizar el teléfono restringiendo a 9 dígitos y solo números
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permite solo dígitos y hasta 9 caracteres
    if (/^\d*$/.test(value) && value.length <= 9) {
      setPhone(value);
    }
  };

  const removeIpress = (center: string) => {
    setIpress(ipress.filter(hc => hc !== center));
  };

  const shouldShowIpress = () => {
    return role === 'Colaborador';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-custom-blue p-4">
      <form onSubmit={handleRegister} className="bg-white p-10 rounded-lg shadow-lg w-full max-w-4xl">
        <h2 className="text-3xl text-custom-blue font-bold mb-8 text-center">Registrarse</h2>

        {/* Sección 1: Información General */}
        <section className="mb-8 bg-gray-50 p-6 rounded-md shadow">
          <h3 className="text-xl font-semibold text-custom-blue mb-4">1. Información General</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DNI */}
            <div>
              <label className="block text-custom-blue text-sm font-bold mb-2">
                DNI<span className="text-red-500"> *</span>
              </label>
              <input
                type="number"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                maxLength={10}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
              {dni.length > 10 && (
                <p className="text-red-500 text-xs italic mt-2">
                  El DNI no puede tener más de 10 caracteres
                </p>
              )}
            </div>
            {/* Nombre */}
            <div>
              <label className="block text-custom-blue text-sm font-bold mb-2">
                Nombre(s)<span className="text-red-500"> *</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
            </div>
            {/* Apellido Paterno */}
            <div>
              <label className="block text-custom-blue text-sm font-bold mb-2">
                Apellido Paterno<span className="text-red-500"> *</span>
              </label>
              <input
                type="text"
                value={firstLastName}
                onChange={(e) => setFirstLastName(e.target.value)}
                maxLength={100}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
            </div>
            {/* Apellido Materno */}
            <div>
              <label className="block text-custom-blue text-sm font-bold mb-2">
                Apellido Materno<span className="text-red-500"> *</span>
              </label>
              <input
                type="text"
                value={secondLastName}
                onChange={(e) => setSecondLastName(e.target.value)}
                maxLength={100}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
            </div>
          </div>
        </section>

        {/* Sección 2: Permisos */}
        <section className="mb-8 bg-gray-50 p-6 rounded-md shadow">
          <h3 className="text-xl font-semibold text-custom-blue mb-4">2. Permisos</h3>
          <div className="space-y-6">
            {/* Rol */}
            <div>
              <label className="block text-custom-blue text-sm font-bold mb-2">
                Rol<span className="text-red-500"> *</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              >
                <option value="">Seleccione un rol</option>
                {rolesList.map((rol) => (
                  <option key={rol} value={rol}>
                    {rol}
                  </option>
                ))}
              </select>
            </div>
            {/* Autocomplete de IPRESS */}
            {shouldShowIpress() && (
              <div className="relative" ref={dropdownRef}>
                <label className="block text-custom-blue text-sm font-bold mb-2">
                  IPRESS
                  <span className="text-red-500"> * (Seleccione al menos 1)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={ipressSearch}
                    onChange={(e) => setIpressSearch(e.target.value)}
                    disabled={!role}
                    placeholder="Buscar IPRESS..."
                    onFocus={() => setDropdownOpen(true)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-blue"
                  />
                  {ipressSearch && (
                    <button
                      type="button"
                      onClick={() => setIpressSearch('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {dropdownOpen && (
                  <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto">
                    {(ipressSearch ? filteredIpress : ipressList).map((center) => (
                      <li
                        key={center}
                        onClick={() => toggleIpress(center)}
                        className={`cursor-pointer px-4 py-2 hover:bg-indigo-100 ${ipress.includes(center) ? 'bg-indigo-50' : ''
                          }`}
                      >
                        {center}
                      </li>
                    ))}
                  </ul>
                )}
                {ipress.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold mb-1">Seleccionados:</p>
                    <div className="flex flex-wrap gap-2">
                      {ipress.map((center) => (
                        <div
                          key={center}
                          className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                        >
                          <span>{center}</span>
                          <button
                            type="button"
                            onClick={() => removeIpress(center)}
                            className="ml-1 text-blue-600 hover:text-blue-900"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Sección 3: Credenciales */}
        <section className="mb-8 bg-gray-50 p-6 rounded-md shadow">
          <h3 className="text-xl font-semibold text-custom-blue mb-4">3. Credenciales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label className="block text-custom-blue text-sm font-bold mb-2">
                Correo Electrónico<span className="text-red-500"> *</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                  ? 'focus:ring-gray-500'
                  : 'focus:ring-red-500'
                  }`}
                required
              />
              {!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email && (
                <p className="text-red-500 text-xs italic mt-2">
                  Correo electrónico no válido
                </p>
              )}
            </div>
            {/* Teléfono */}
            <div>
              <label className="block text-custom-blue text-sm font-bold mb-2">
                Teléfono<span className="text-red-500"> *</span>
              </label>
              <input
                type="text" // Cambiado a 'text' para que funcione maxLength y el manejo de dígitos
                value={phone}
                onChange={handlePhoneChange}
                placeholder="Ingrese 9 dígitos"
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
              {/* Muestra mensaje de error si el teléfono no tiene exactamente 9 dígitos y no está vacío */}
              {phone.length > 0 && phone.length !== 9 && (
                <p className="text-red-500 text-xs italic mt-2">
                  El teléfono debe tener exactamente 9 dígitos
                </p>
              )}
            </div>
            {/* Contraseña */}
            <div className="relative">
              <label className="block text-custom-blue text-sm font-bold mb-2">
                Contraseña<span className="text-red-500"> *</span>
              </label>
              <input
                type={passwordVisible ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={255}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm"
              >
                {passwordVisible ? (
                  <EyeIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
            {/* Confirmar Contraseña */}
            <div className="relative">
              <label className="block text-custom-blue text-sm font-bold mb-2">
                Confirmar Contraseña<span className="text-red-500"> *</span>
              </label>
              <input
                type={passwordVisible ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                maxLength={255}
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${password === confirmPassword ? 'focus:ring-gray-500' : 'focus:ring-red-500'
                  }`}
                required
              />
              {!confirmPassword && (
                <p className="text-red-500 text-xs italic mt-2">
                  Confirma tu contraseña
                </p>
              )}
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-red-500 text-xs italic mt-2">
                  Las contraseñas no coinciden
                </p>
              )}
              {password && confirmPassword && password === confirmPassword && (
                <p className="text-green-500 text-xs italic mt-2">
                  Las contraseñas coinciden
                </p>
              )}
            </div>
          </div>
        </section>

        <button
          type="submit"
          className={`w-full mt-8 ${isFormValid() ? 'bg-custom-blue' : 'bg-gray-400'
            } text-white font-bold py-3 rounded-md transition duration-300`}
          disabled={!isFormValid()}
        >
          Registrarse
        </button>
        <p className="mt-4 text-center text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <a href="/login" className="text-custom-blue hover:text-gray-900">
            Iniciar sesión
          </a>
        </p>
      </form>
    </div>
  );
};

export default Register;
