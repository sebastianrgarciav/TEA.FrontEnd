import React, { useState } from 'react';
import { ArrowLeftEndOnRectangleIcon, EyeIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/profile.png';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const userName = sessionStorage.getItem('user') || 'Invitado';

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  const handleViewProfile = () => {
    setMenuOpen(false)
    navigate('/profile');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-custom-blue text-black shadow z-50">
      <div className="px-5">
        <div className="flex h-16 items-center">
          <div className="text-white text-md md:text-xl font-bold ml-10">
            TEA - Trastorno del Espectro Autista
          </div>
          <div className="ml-auto relative">
            <button onClick={toggleMenu} className="focus:outline-none">
              <img src={logo} alt="Logo" className="h-10 w-10 md:h-11 w-12 rounded-full" />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 w-48 bg-white rounded-md shadow-lg py-1 border"
                style={{
                  zIndex: 1050,
                  backgroundColor: 'white',
                  backgroundBlendMode: 'normal'
                }}
              >
                <label className="block px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 w-full text-left font-bold">
                  {userName}
                </label>
                <button
                  onClick={handleViewProfile}
                  className="block px-4 py-2 text-sm text-custom-gray hover:bg-gray-100 w-full text-left"
                >
                  <EyeIcon className="h-5 w-5 inline-block mr-2" />
                  Ver perfil
                </button>
                <button
                  onClick={handleLogout}
                  className="block px-4 py-2 text-sm text-custom-gray hover:bg-gray-100 w-full text-left"
                >
                  <ArrowLeftEndOnRectangleIcon className="h-5 w-5 inline-block mr-2" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
