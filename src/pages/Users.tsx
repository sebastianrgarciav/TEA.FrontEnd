import React, { useState, useEffect } from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import EditIcon from '@mui/icons-material/Edit';
import RemoveIcon from '@mui/icons-material/DeleteOutline';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  MenuItem,
  IconButton,
  TextField,
  Button,
  Grid,
  Select,
  InputLabel,
  FormControl,
  useMediaQuery,
  Autocomplete
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import userService from '../services/userService';

interface UserData {
  id: string;
  dni: string;
  name: string;
  firstLastName: string;
  secondLastName: string;
  role: string;
  ipress: string;
  email: string;
  phone: string;
  isApproved: boolean;
}

const rolesList = [
  'Administrador',
  'Colaborador',
  'Monitor'
];

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

const getUsers = async (data: {
  pageNumber: number;
  pageSize: number;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  filters?: Partial<{
    name: string;
    firstLastName: string;
    secondLastName: string;
    dni: string;
    role: string;
    ipress: string;
    email: string;
    phone: string;
    isApproved: boolean | string;
  }>;
}) => {
  const response = await userService.getUsers(data);
  return {
    users: response.data?.users || [],
    total: response.data?.total || 0,
  };
};

const Users: React.FC = () => {
  const [rows, setRows] = useState<UserData[]>([]);
  const [filteredRows, setFilteredRows] = useState<UserData[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState<keyof UserData>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [filters, setFilters] = useState<Partial<UserData>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Manejo de centros seleccionados en formato array
  const [ipressSelected, setIpressSelected] = useState<string[]>([]);

  // Para detectar si es pantalla pequeña (móvil)
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const role = sessionStorage.getItem('role');
    if (role !== 'Administrador') {
      Swal.fire('Acceso denegado', 'No tienes permisos a esta vista', 'warning').then(() => {
        navigate('/login');
      });
    }
    const fetchData = async () => {
      const { users, total } = await getUsers({
        pageNumber: page,
        pageSize: rowsPerPage,
        sortColumn,
        sortDirection,
        filters,
      });
      setRows(users);
      setFilteredRows(users);
      setTotalUsers(total);
    };
    fetchData();
  }, [page, rowsPerPage, sortColumn, sortDirection, filters]);

  useEffect(() => {
    // Al abrir el diálogo, separamos los centros de salud del string en array
    if (selectedUser) {
      setIpressSelected(
        selectedUser.ipress ? selectedUser.ipress.split('\n') : []
      );
    }
  }, [selectedUser]);

  const handlePreviousPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < Math.ceil(totalUsers / rowsPerPage) - 1) {
      setPage(page + 1);
    }
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const sortData = (column: keyof UserData) => {
    setSortColumn(column);
    setSortDirection((prevDirection) => (prevDirection === 'asc' ? 'desc' : 'asc'));
  };

  const renderSortIcon = (column: keyof UserData) => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />;
    }
    return null;
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: UserData) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDialogSave = async () => {
    if (selectedUser) {
      // Si el rol es Administrador o Coordinador General, se fuerza a vaciar centros
      const role = selectedUser.role;
      const updatedIpress =
        role === 'Administrador'
          ? ''
          : ipressSelected.join('\n');

      const updatedUser = { ...selectedUser, ipress: updatedIpress };

      try {
        const response = await userService.editUser(updatedUser);
        if (response.status === 200) {
          Swal.fire('¡Guardado!', 'Los cambios han sido guardados exitosamente.', 'success');
          const updatedRows = rows.map((row) =>
            row.id === updatedUser.id ? { ...row, ...updatedUser } : row
          );
          setRows(updatedRows);
          setFilteredRows(updatedRows);
        } else {
          throw new Error('Error al guardar los cambios');
        }
      } catch (error) {
        Swal.fire(
          'Error',
          'Hubo un problema al guardar los cambios. Por favor, intenta nuevamente.',
          'error'
        );
        console.error('Error al editar el usuario:', error);
      } finally {
        setDialogOpen(false);
      }
    }
  };

  const handleInputChange = (key: keyof UserData, value: string | boolean) => {
    if (selectedUser) {
      setSelectedUser({ ...selectedUser, [key]: value });
    }
  };

  const handleRoleChange = (value: string) => {
    if (selectedUser) {
      const newUser = { ...selectedUser, role: value };
      // Si es Admin o Coordinador General, limpiamos el campo de centros
      if (value === 'Administrador') {
        newUser.ipress = '';
        setIpressSelected([]);
      }
      setSelectedUser(newUser);
    }
  };

  const toggleFilterVisibility = () => {
    setShowFilters(!showFilters);
  };

  const handleFilterChange = (column: keyof UserData, value: string) => {
    setFilters({
      ...filters,
      [column]: value,
    });
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(0);
  };

  const renderUsers = (users: UserData[]) => {
    if (!users.length) {
      return (
        <tr>
          <td colSpan={10} className="text-center py-4 text-gray-500">
            No se encontraron usuarios.
          </td>
        </tr>
      );
    }

    return users.map((user) => (
      <tr key={user.id} className="hover:bg-gray-100">
        <td className="px-6 py-4 text-sm">{user.name}</td>
        <td className="px-6 py-4 text-sm">{user.firstLastName}</td>
        <td className="px-6 py-4 text-sm">{user.secondLastName}</td>
        <td className="px-6 py-4 text-sm">{user.dni}</td>
        <td className="px-6 py-4 text-sm">{user.role}</td>
        <td className="px-6 py-4 text-sm">
          <ul>
            {user.ipress.split('\n').map((center, index) => (
              <li key={index}>• {center || 'N/A'}</li>
            ))}
          </ul>
        </td>
        <td className="px-6 py-4 text-sm">{user.email}</td>
        <td className="px-6 py-4 text-sm">{user.phone}</td>
        <td className="px-6 py-4 text-sm">{user.isApproved ? 'Sí' : 'No'}</td>
        <td className="px-6 py-4 text-sm">
          <IconButton onClick={(event) => handleMenuOpen(event, user)}>
            <MoreVertIcon />
          </IconButton>
        </td>
      </tr>
    ));
  };

  const renderFilterRow = () => (
    <tr>
      {(
        [
          'name',
          'firstLastName',
          'secondLastName',
          'dni',
          'role',
          'ipress',
          'email',
          'phone',
          'isApproved',
        ] as (keyof UserData)[]
      ).map((key) => (
        <td key={key} className="px-6 py-4 whitespace-nowrap text-xs sm:text-sm">
          <TextField
            value={(filters as any)[key] || ''}
            onChange={(e) => handleFilterChange(key, e.target.value)}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#01723E',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#01723E',
              },
            }}
          />
        </td>
      ))}
      <td className="px-6 py-4 whitespace-nowrap text-xs sm:text-sm"></td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-20 px-4">
      <div className="mx-auto">
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <div className="flex items-center space-x-2 mb-2 sm:mb-0">
              <h2 className="text-xl font-semibold">Total de usuarios [{totalUsers}]</h2>
              <button onClick={toggleFilterVisibility} className="p-2">
                {showFilters ? <FilterAltOffIcon /> : <FilterAltIcon />}
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Button
                onClick={handleClearFilters}
                variant="contained"
                sx={{
                  backgroundColor: '#000',
                  '&:hover': { backgroundColor: 'grey' },
                  textTransform: 'none',
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => sortData('name')}
                  >
                    <div className="flex items-center">
                      <span>Nombre</span>
                      {renderSortIcon('name')}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => sortData('firstLastName')}
                  >
                    <div className="flex items-center">
                      <span>Apellido Paterno</span>
                      {renderSortIcon('firstLastName')}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => sortData('secondLastName')}
                  >
                    <div className="flex items-center">
                      <span>Apellido Materno</span>
                      {renderSortIcon('secondLastName')}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => sortData('dni')}
                  >
                    <div className="flex items-center">
                      <span>DNI</span>
                      {renderSortIcon('dni')}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => sortData('role')}
                  >
                    <div className="flex items-center">
                      <span>Rol</span>
                      {renderSortIcon('role')}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => sortData('ipress')}
                  >
                    <div className="flex items-center">
                      <span>IPRESS</span>
                      {renderSortIcon('ipress')}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => sortData('email')}
                  >
                    <div className="flex items-center">
                      <span>Email</span>
                      {renderSortIcon('email')}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => sortData('phone')}
                  >
                    <div className="flex items-center">
                      <span>Teléfono</span>
                      {renderSortIcon('phone')}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => sortData('isApproved')}
                  >
                    <div className="flex items-center">
                      <span>Aprobado</span>
                      {renderSortIcon('isApproved')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
                {showFilters && renderFilterRow()}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {renderUsers(rows)}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4">
            <div className="flex items-center space-x-2 mb-5 sm:mb-0">
              <label htmlFor="rowsPerPage" className="text-sm">
                Elementos por página:
              </label>
              <select
                id="rowsPerPage"
                value={rowsPerPage}
                onChange={(e) => handleRowsPerPageChange(parseInt(e.target.value))}
                className="form-select text-md"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <IconButton onClick={handlePreviousPage} disabled={page === 0}>
                <ChevronLeftIcon className="w-5 h-5" />
              </IconButton>
              <span className="text-sm">
                Página {page + 1} de {Math.ceil(totalUsers / rowsPerPage)}
              </span>
              <IconButton
                onClick={handleNextPage}
                disabled={page >= Math.ceil(totalUsers / rowsPerPage) - 1}
              >
                <ChevronRightIcon className="w-5 h-5" />
              </IconButton>
            </div>
          </div>
        </div>
      </div>

      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        classes={{ paper: 'rounded-lg shadow-lg bg-white' }}
      >
        <MenuItem
          onClick={handleEdit}
          className="flex items-center space-x-2 px-4 hover:bg-gray-100 focus:bg-gray-100 rounded-md transition duration-200"
        >
          <EditIcon style={{ fontSize: '20px', color: '#023e8a' }} />
          <span style={{ color: '#023e8a', fontWeight: 'bold' }}>Editar</span>
        </MenuItem>
        <MenuItem
          onClick={async () => {
            handleMenuClose();
            if (!selectedUser) return;
            const confirm = await Swal.fire({
              title: '¿Eliminar usuario?',
              text: 'No podrás revertir esta acción.',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Sí, eliminar',
              cancelButtonText: 'Cancelar',
              confirmButtonColor: '#d33',
              cancelButtonColor: '#3085d6',
            });
            if (confirm.isConfirmed) {
              try {
                await userService.removeUser(selectedUser.id);
                Swal.fire('Eliminado', 'El usuario fue eliminado.', 'success').then(() => {
                  window.location.reload();
                });
              } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error');
              }
            }
          }}
          className="flex items-center space-x-2 px-4 hover:bg-gray-100 focus:bg-gray-100 rounded-md transition duration-200"
        >
          <RemoveIcon style={{ fontSize: '20px', color: '#d33' }} />
          <span style={{ color: '#d33', fontWeight: 'bold' }}>Eliminar</span>
        </MenuItem>
      </Menu>

      {isDialogOpen && selectedUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          // ESTILOS PARA MÓVIL
          style={{
            // Forzamos scroll en móvil si el contenido supera la altura
            overflowY: isMobile ? 'auto' : 'visible',
          }}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6"
            // Ajustamos la altura máxima y scroll interno
            style={{
              maxHeight: isMobile ? 'calc(100% - 40px)' : 'auto',
              overflowY: isMobile ? 'auto' : 'visible',
            }}
          >
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b pb-4 text-center">
              Editar Usuario
            </h2>
            <Grid container spacing={2}>
              {/* Columna 1 */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Nombre"
                  fullWidth
                  value={selectedUser.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Apellido Paterno"
                  fullWidth
                  value={selectedUser.firstLastName || ''}
                  onChange={(e) => handleInputChange('firstLastName', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Apellido Materno"
                  fullWidth
                  value={selectedUser.secondLastName || ''}
                  onChange={(e) => handleInputChange('secondLastName', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  type="number"
                  label="DNI"
                  fullWidth
                  value={selectedUser.dni || ''}
                  onChange={(e) => handleInputChange('dni', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              {/* Columna 2 */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="role-label">Rol</InputLabel>
                  <Select
                    labelId="role-label"
                    label="Rol"
                    value={selectedUser.role || ''}
                    onChange={(e) => handleRoleChange(e.target.value as string)}
                  >
                    {rolesList.map((role) => (
                      <MenuItem key={role} value={role}>
                        {role}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  multiple
                  options={ipressList}
                  value={ipressSelected}
                  onChange={(event, newValue) => {
                    setIpressSelected(newValue);
                  }}
                  filterSelectedOptions
                  disabled={
                    selectedUser.role === 'Administrador' ||
                    selectedUser.role === 'Coordinador General'
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="IPRESS"
                      placeholder="Buscar..."
                      variant="outlined"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  fullWidth
                  value={selectedUser.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Teléfono"
                  fullWidth
                  type="number"
                  value={selectedUser.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="approved-label">Aprobado</InputLabel>
                  <Select
                    labelId="approved-label"
                    label="Aprobado"
                    value={selectedUser.isApproved ? 'true' : 'false'}
                    onChange={(e) =>
                      handleInputChange('isApproved', e.target.value === 'true')
                    }
                  >
                    <MenuItem value="true">Sí</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <div className="flex justify-end mt-6 space-x-4 border-t pt-4">
              <Button
                sx={{
                  color: '#023e8a',
                  '&:hover': { backgroundColor: 'rgba(0, 31, 26, 0.04)' },
                }}
                onClick={handleDialogClose}>
                Cancelar
              </Button>
              <Button variant="contained" className="bg-custom-blue" onClick={handleDialogSave}>
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
