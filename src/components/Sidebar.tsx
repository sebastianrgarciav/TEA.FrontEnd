import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ClipboardDocumentCheckIcon, DocumentDuplicateIcon, UserPlusIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import DashboardIcon from '@mui/icons-material/Dashboard';
const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  const handleClickOutside = (event: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <>
      <button
        className="fixed top-1 left-0 p-2 m-2 z-[100] rounded-md text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
        onClick={toggleSidebar}
      >
        <span className="sr-only">Toggle sidebar</span>
        <svg
          className="h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleSidebar}></div>
      )}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-center h-16 bg-custom-blue shadow-md">
          <span className="text-xl font-bold text-white">Evaluación de Habilidades del Desarrollo Infantil en Niños (16 a 30 meses)</span>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          <Link
            to="/dashboard"
            className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-200"
            onClick={toggleSidebar}
          >
            <DashboardIcon className="h-6 w-6 mr-3" />
            Dashboard
          </Link>
          <Link
            to="/children"
            className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-200"
            onClick={toggleSidebar}
          >
            <DocumentDuplicateIcon className="h-6 w-6 mr-3" />
            Registro de niños
          </Link>
          <div hidden={sessionStorage.getItem('role') !== 'Administrador'}>
            <Link
              to="/users"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-200"
              onClick={toggleSidebar}
            >
              <UserPlusIcon className="h-6 w-6 mr-3" />
              Usuarios
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
