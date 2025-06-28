import React, { useEffect, useState, useRef } from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ListIcon from '@mui/icons-material/List';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { XMarkIcon } from '@heroicons/react/24/solid';
import Swal from 'sweetalert2';
import {
  IconButton, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Collapse, Box, Menu, MenuItem, Autocomplete, FormControl, InputLabel, Select, Chip, OutlinedInput
} from '@mui/material';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import ChildrenService from '../services/childrenService';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

const columns = [
  { id: 'createdAt', label: 'Fecha de creación' },
  { id: 'ipress', label: 'Ipress' },
  { id: 'childDNI', label: 'DNI del niño' },
  { id: 'childName', label: 'Nombre del niño' },
  { id: 'birthDate', label: 'Fecha de nacimiento' },
  { id: 'age', label: 'Edad del niño (meses)' },
  { id: 'actions', label: 'Acciones' },
];

const evalColumns = [
  { id: 'index', label: 'N° de Evaluación' },
  { id: 'evaluationDate', label: 'Fecha de la evaluación' },
  { id: 'relationship', label: 'Parentesco' },
  { id: 'guardianName', label: 'Nombre del apoderado' },
  { id: 'guardianPhone', label: 'Teléfono del apoderado' },
  { id: 'riskLevel', label: 'Riesgo' },
  { id: 'totalScore', label: 'Puntaje' },
  { id: 'actions', label: 'Acciones' },
];

const Children = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<any>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedChild, setSelectedChild] = useState<any | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [openEvalDialog, setOpenEvalDialog] = useState(false);
  const [openEvalDetail, setOpenEvalDetail] = useState<{ [key: string]: boolean }>({});
  const [evalDetails, setEvalDetails] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(false);
  const [ipressFilter, setIpressFilter] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editChild, setEditChild] = useState<any | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedIpress, setSelectedIpress] = useState<string[]>([]);
  const [filteredIpress, setFilteredIpress] = useState<string[]>(ipressList);
  const [ipressSearch, setIpressSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [exportLoading, setExportLoading] = useState(false);
  const autismoTestUrl = `${window.location.origin}/autismotest`;
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Obtener el rol del usuario desde sessionStorage
  const userRole = sessionStorage.getItem('role') || '';

  // Funciones para verificar permisos según el rol
  const canExport = () => userRole === 'Administrador' || userRole === 'Monitor';
  const canEdit = () => userRole === 'Administrador';
  const canDelete = () => userRole === 'Administrador';

  useEffect(() => {
    fetchChildren();
    // eslint-disable-next-line
  }, [page, rowsPerPage, sortColumn, sortDirection, filters]);

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

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const userId = sessionStorage.getItem('userId');
      
      // Limpiar filtros vacíos
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => 
          value !== null && value !== undefined && value !== ''
        )
      );

      const res = await ChildrenService.getAllAutismoChildren({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        userId,
        filters: cleanFilters,
        sortColumn,
        sortDirection,
      });
      setRows(res.data?.children || res.data?.data || []);
      setTotal(res.data?.total || res.data?.count || 0);
    } catch (e) {
      Swal.fire('Error', 'No se pudo cargar la lista de niños', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (childId: string) => {
    const userId = sessionStorage.getItem('userId') || '';
    const result = await Swal.fire({
      title: '¿Eliminar niño?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (result.isConfirmed) {
      try {
        await ChildrenService.deleteChild(childId, userId);
        Swal.fire('Eliminado', 'Niño eliminado correctamente', 'success');
        fetchChildren();
      } catch {
        Swal.fire('Error', 'No se pudo eliminar el niño', 'error');
      }
    }
  };

  const handleShowEvaluations = async (child: any) => {
    setSelectedChild(child);
    setOpenEvalDialog(true);
    setLoading(true);
    try {
      const res = await ChildrenService.getEvaluationsByChildId(child.id);
      setEvaluations(res.data || []);
    } catch {
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowEvalDetail = async (evaluationId: string) => {
    if (openEvalDetail[evaluationId]) {
      setOpenEvalDetail((prev) => ({ ...prev, [evaluationId]: false }));
      return;
    }
    setOpenEvalDetail((prev) => ({ ...prev, [evaluationId]: true }));
    const res = await ChildrenService.getEvaluationDetails(evaluationId);
    setEvalDetails((prev) => ({ ...prev, [evaluationId]: res.data || [] }));
  };

  const sortData = (column: string) => {
    setSortColumn(column);
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const renderSortIcon = (column: string) => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />;
    }
    return null;
  };

  const handleFilterChange = (column: string, value: string) => {
    setFilters({ ...filters, [column]: value });
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({});
    setIpressFilter(null);
    setPage(0);
  };

  const handlePreviousPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < Math.ceil(total / rowsPerPage) - 1) setPage(page + 1);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  // Acciones menú
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuChildId, setMenuChildId] = useState<string | null>(null);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, childId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuChildId(childId);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuChildId(null);
  };

  const handleEdit = (child: any) => {
    setEditChild({ ...child });
    setEditModalOpen(true);
  };

  const handleEditChange = (field: string, value: any) => {
    setEditChild((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async () => {
    try {
      await ChildrenService.editChild({
        id: editChild.id,
        ipress: editChild.ipress,
        childDNI: editChild.childDNI,
        childName: editChild.childName,
        birthDate: editChild.birthDate,
      });
      setEditModalOpen(false);
      setEditChild(null);
      Swal.fire('Éxito', 'Niño actualizado correctamente', 'success');
      fetchChildren();
    } catch {
      Swal.fire('Error', 'No se pudo actualizar el niño', 'error');
    }
  };

  const isEditValid = editChild &&
    editChild.childDNI &&
    /^[0-9]{8}$/.test(editChild.childDNI) &&
    editChild.childName &&
    editChild.ipress &&
    editChild.birthDate &&
    new Date(editChild.birthDate) <= new Date();

  const renderFilterRow = () => (
    <TableRow>
      <TableCell>
        <TextField
          type="date"
          value={filters.createdAt || ''}
          onChange={(e) => handleFilterChange('createdAt', e.target.value)}
          variant="outlined"
          size="small"
        />
      </TableCell>
      <TableCell>
        <Autocomplete
          options={ipressList}
          value={ipressFilter}
          onChange={(_, newValue) => {
            setIpressFilter(newValue);
            handleFilterChange('ipress', newValue || '');
          }}
          renderInput={(params) => (
            <TextField {...params} variant="outlined" size="small" label="Ipress" />
          )}
        />
      </TableCell>
      <TableCell>
        <TextField
          value={filters.childDNI || ''}
          onChange={(e) => handleFilterChange('childDNI', e.target.value)}
          variant="outlined"
          size="small"
        />
      </TableCell>
      <TableCell>
        <TextField
          value={filters.childName || ''}
          onChange={(e) => handleFilterChange('childName', e.target.value)}
          variant="outlined"
          size="small"
        />
      </TableCell>
      <TableCell>
        <TextField
          type="date"
          value={filters.birthDate || ''}
          onChange={(e) => handleFilterChange('birthDate', e.target.value)}
          variant="outlined"
          size="small"
        />
      </TableCell>
      <TableCell>
        <TextField
          value={filters.age || ''}
          onChange={(e) => handleFilterChange('age', e.target.value)}
          variant="outlined"
          size="small"
          label="Meses"
        />
      </TableCell>
      <TableCell></TableCell>
    </TableRow>
  );

  const handleExport = async () => {
    if (selectedIpress.length === 0) {
      Swal.fire('Error', 'Debe seleccionar al menos una IPRESS', 'error');
      return;
    }
    if (!startDate || !endDate) {
      Swal.fire('Error', 'Debe seleccionar fecha de inicio y fecha de fin', 'error');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      Swal.fire('Error', 'La fecha de inicio no puede ser mayor a la fecha de fin', 'error');
      return;
    }

    setExportLoading(true);
    try {
      const res = await ChildrenService.exportAutismoChildren({
        ipress: selectedIpress,
        startDate,
        endDate,
      });
      // Descargar el archivo
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      const now = new Date();
      now.setHours(now.getHours() - 5); // Ajuste manual a GMT-5
      const fecha = now.toISOString().replace(/[:.]/g, '').replace('T', '_').slice(0, 15);
      link.href = url;
      link.setAttribute('download', `datos_niños_${fecha}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      Swal.fire('Éxito', 'Datos exportados correctamente', 'success');
      setExportModalOpen(false);
      setSelectedIpress([]);
      setIpressSearch('');
      setStartDate('');
      setEndDate('');
    } catch (error) {
      Swal.fire('Error', 'No se pudo exportar los datos', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  const toggleIpress = (center: string) => {
    if (selectedIpress.includes(center)) {
      setSelectedIpress(selectedIpress.filter(hc => hc !== center));
    } else {
      setSelectedIpress([...selectedIpress, center]);
    }
    setDropdownOpen(false);
  };

  const removeIpress = (center: string) => {
    setSelectedIpress(selectedIpress.filter(hc => hc !== center));
  };

  const selectAllIpress = () => {
    setSelectedIpress(ipressList);
    setDropdownOpen(false);
  };

  const clearAllIpress = () => {
    setSelectedIpress([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-20 px-4">
      <div className="mx-auto">
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold">Total de niños [{total}]</h2>
              <button onClick={() => setShowFilters(!showFilters)} className="p-2">
                {showFilters ? <FilterAltOffIcon /> : <FilterAltIcon />}
              </button>
            </div>
            <div className="flex flex-row items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                <Button
                  onClick={handleClearFilters}
                  variant="contained"
                  sx={{
                    backgroundColor: '#000',
                    '&:hover': { backgroundColor: 'grey' },
                    textTransform: 'none',
                    minWidth: 0,
                    padding: '8px 16px',
                  }}
                  startIcon={<DeleteSweepIcon />}
                  className="flex-1 sm:flex-initial"
                >
                  <span className="hidden sm:inline">Limpiar Filtros</span>
                </Button>
                {canExport() && (
                  <Button
                    onClick={() => setExportModalOpen(true)}
                    variant="contained"
                    sx={{
                      backgroundColor: '#28a745',
                      '&:hover': { backgroundColor: '#218838' },
                      textTransform: 'none',
                      minWidth: 0,
                      padding: '8px 16px',
                    }}
                    startIcon={<DownloadIcon />}
                    className="flex-1 sm:flex-initial"
                  >
                    <span className="hidden sm:inline">Exportar</span>
                  </Button>
                )}
                <Button
                  onClick={() => setQrModalOpen(true)}
                  variant="contained"
                  color="primary"
                  sx={{ textTransform: 'none', minWidth: 0, padding: '8px 16px' }}
                  startIcon={<QrCodeIcon />}
                  className="flex-1 sm:flex-initial"
                >
                  <span className="hidden sm:inline">Generar QR</span>
                </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table className="min-w-full divide-y divide-gray-200">
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell
                      key={col.id}
                      className="cursor-pointer"
                      onClick={() => col.id !== 'actions' && sortData(col.id)}
                    >
                      <div className="flex items-center">
                        <span>{col.label}</span>
                        {col.id !== 'actions' && renderSortIcon(col.id)}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
                {showFilters && renderFilterRow()}
              </TableHead>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center">
                      No se encontraron niños.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((child) => (
                    <TableRow key={child.id}>
                      <TableCell>{new Date(child.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{child.ipress}</TableCell>
                      <TableCell>{child.childDNI}</TableCell>
                      <TableCell>{child.childName}</TableCell>
                      <TableCell>{new Date(child.birthDate).toLocaleDateString()}</TableCell>
                      <TableCell>{child.age}</TableCell>
                      <TableCell>
                        <IconButton onClick={(e) => handleMenuOpen(e, child.id)}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={menuAnchorEl}
                          keepMounted
                          open={Boolean(menuAnchorEl) && menuChildId === child.id}
                          onClose={handleMenuClose}
                        >
                          {canEdit() && (
                            <MenuItem onClick={() => { handleMenuClose(); handleEdit(child); }}>
                              <EditIcon fontSize="small" sx={{ mr: 1 }} /> Editar
                            </MenuItem>
                          )}
                          {canDelete() && (
                            <MenuItem onClick={() => { handleMenuClose(); handleDelete(child.id); }}>
                              <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Eliminar
                            </MenuItem>
                          )}
                          <MenuItem onClick={() => { handleMenuClose(); handleShowEvaluations(child); }}>
                            <VisibilityIcon fontSize="small" sx={{ mr: 1 }} /> Ver Evaluaciones
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
                Página {page + 1} de {Math.ceil(total / rowsPerPage)}
              </span>
              <IconButton
                onClick={handleNextPage}
                disabled={page >= Math.ceil(total / rowsPerPage) - 1}
              >
                <ChevronRightIcon className="w-5 h-5" />
              </IconButton>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluaciones Dialog */}
      <Dialog
        open={openEvalDialog}
        onClose={() => {
          setOpenEvalDetail({});
          setEvalDetails({});
          setOpenEvalDialog(false);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <span className="text-custom-blue font-bold text-lg">Lista de evaluaciones</span>
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {evalColumns.map((col) => (
                    <TableCell key={col.id} className="text-custom-blue font-semibold">
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[...evaluations].sort((a, b) => new Date(a.evaluationDate).getTime() - new Date(b.evaluationDate).getTime()).map((ev, idx, arr) => (
                  <React.Fragment key={ev.id}>
                    <TableRow>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{new Date(ev.evaluationDate).toLocaleDateString()}</TableCell>
                      <TableCell>{ev.relationship}</TableCell>
                      <TableCell>{ev.guardianName}</TableCell>
                      <TableCell>{ev.guardianPhone}</TableCell>
                      <TableCell>{ev.riskLevel}</TableCell>
                      <TableCell>{ev.totalScore}</TableCell>
                      <TableCell>
                        <Tooltip title={openEvalDetail[ev.id] ? 'Ocultar evaluación' : 'Ver evaluación'}>
                          <IconButton
                            sx={{ color: '#0077b6' }}
                            onClick={() => handleShowEvalDetail(ev.id)}
                          >
                            {openEvalDetail[ev.id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={evalColumns.length} style={{ padding: 0, border: 0 }}>
                        <Collapse in={!!openEvalDetail[ev.id]} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 2 }}>
                            <span className="font-semibold">Preguntas y respuestas</span>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell className="text-custom-blue font-semibold">N°</TableCell>
                                  <TableCell className="text-custom-blue font-semibold">Pregunta</TableCell>
                                  <TableCell className="text-custom-blue font-semibold">Respuesta</TableCell>
                                  <TableCell className="text-custom-blue font-semibold">Puntaje</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {(Array.isArray(evalDetails[ev.id]) && evalDetails[ev.id].length > 0) ? (
                                  evalDetails[ev.id].map((ans: any, idx: number) => (
                                    <TableRow key={ans.id || idx}>
                                      <TableCell>{ans.questionNumber}</TableCell>
                                      <TableCell>{ans.questionText}</TableCell>
                                      <TableCell>{ans.answer}</TableCell>
                                      <TableCell>{ans.points}</TableCell>
                                    </TableRow>
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell colSpan={4} align="center">No hay preguntas ni respuestas.</TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenEvalDetail({});
              setEvalDetails({});
              setOpenEvalDialog(false);
            }}
            sx={{ color: '#0077b6', fontWeight: 'bold' }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Editar Niño</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={ipressList}
            value={editChild?.ipress || ''}
            onChange={(_, newValue) => handleEditChange('ipress', newValue || '')}
            renderInput={(params) => (
              <TextField {...params} label="Ipress" margin="normal" fullWidth />
            )}
          />
          <TextField
            label="DNI del niño"
            value={editChild?.childDNI || ''}
            onChange={e => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 8) handleEditChange('childDNI', value);
            }}
            margin="normal"
            fullWidth
            inputProps={{ maxLength: 8 }}
            error={!!editChild?.childDNI && !/^[0-9]{8}$/.test(editChild.childDNI)}
            helperText={editChild?.childDNI && !/^[0-9]{8}$/.test(editChild.childDNI) ? 'Debe tener 8 dígitos numéricos' : ''}
          />
          <TextField
            label="Nombre del niño"
            value={editChild?.childName || ''}
            onChange={e => handleEditChange('childName', e.target.value)}
            margin="normal"
            fullWidth
          />
          <TextField
            label="Fecha de nacimiento"
            type="date"
            value={editChild?.birthDate ? editChild.birthDate.slice(0, 10) : ''}
            onChange={e => handleEditChange('birthDate', e.target.value)}
            margin="normal"
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: new Date().toISOString().split('T')[0] }}
            error={!!editChild?.birthDate && new Date(editChild.birthDate) > new Date()}
            helperText={editChild?.birthDate && new Date(editChild.birthDate) > new Date() ? 'No puede ser una fecha futura' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)} sx={{ color: '#0077b6', fontWeight: 'bold' }}>Cancelar</Button>
          <Button onClick={handleEditSave} variant="contained" sx={{ backgroundColor: '#0077b6', fontWeight: 'bold', '&:hover': { backgroundColor: '#015f33' } }} disabled={!isEditValid}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* QR Modal */}
      <Dialog open={qrModalOpen} onClose={() => { setQrModalOpen(false); setCopySuccess(false); setShowQR(false); }} maxWidth="xs" fullWidth>
        <DialogTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{
              fontWeight: 'bold',
              fontSize: '1.5rem',
              color: '#1976d2',
              letterSpacing: '1px',
              textShadow: '0 2px 8px #1976d233',
              textAlign: 'center',
              fontFamily: 'Montserrat, Arial, sans-serif',
              marginBottom: 2
            }}>
              <span role="img" aria-label="qr" style={{ marginRight: 8 }}></span>
              Enlace a Autismo Test
            </span>
            <div style={{ width: 40, height: 4, background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)', borderRadius: 2, marginTop: 4 }} />
          </div>
        </DialogTitle>
        <DialogContent className="flex flex-col items-center" style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #fff 100%)', borderRadius: 12 }}>
          <div className="mt-2 flex items-center w-full justify-center" style={{ background: '#f5faff', borderRadius: 8, padding: 8, boxShadow: '0 2px 8px #1976d211' }}>
            <span className="break-all text-blue-700 font-mono text-sm" style={{ fontWeight: 500 }}>{autismoTestUrl}</span>
            <IconButton
              aria-label="Copiar enlace"
              onClick={async () => {
                await navigator.clipboard.writeText(autismoTestUrl);
                setCopySuccess(true);
              }}
              sx={{ ml: 1 }}
              style={{ color: '#1976d2' }}
            >
              <ContentCopyIcon />
            </IconButton>
          </div>
          {copySuccess && <span className="text-green-600 text-xs mt-2">¡Enlace copiado!</span>}
          {!showQR && (
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 3, textTransform: 'none', fontWeight: 'bold', borderRadius: 3, fontSize: '1rem', boxShadow: '0 2px 8px #1976d233' }}
              onClick={() => setShowQR(true)}
            >
              <span role="img" aria-label="qr"></span> Generar QR
            </Button>
          )}
          {showQR && (
            <>
              <div id="qr-to-download" className="flex flex-col items-center mt-4" style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 12px #1976d222' }}>
                <QRCodeSVG value={autismoTestUrl} size={180} />
              </div>
              <div className="flex flex-row gap-2 mt-4">
                <Button
                  variant="outlined"
                  color="primary"
                  sx={{ borderRadius: 3, fontWeight: 'bold', boxShadow: '0 2px 8px #1976d211' }}
                  onClick={async () => {
                    const qrElement = document.getElementById('qr-to-download');
                    if (!qrElement) return;
                    const canvas = await html2canvas(qrElement);
                    const link = document.createElement('a');
                    link.href = canvas.toDataURL('image/png');
                    link.download = 'autismo_test_qr.png';
                    link.click();
                  }}
                >
                  Descargar Imagen
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  sx={{ borderRadius: 3, fontWeight: 'bold', boxShadow: '0 2px 8px #1976d211' }}
                  onClick={async () => {
                    const qrElement = document.getElementById('qr-to-download');
                    if (!qrElement) return;
                    const canvas = await html2canvas(qrElement);
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF();
                    const pageWidth = pdf.internal.pageSize.getWidth();
                    const pageHeight = pdf.internal.pageSize.getHeight();
                    const imgProps = pdf.getImageProperties(imgData);
                    const pdfWidth = Math.min(180, pageWidth - 40);
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                    pdf.addImage(imgData, 'PNG', (pageWidth - pdfWidth) / 2, 40, pdfWidth, pdfHeight);
                    pdf.save('autismo_test_qr.pdf');
                  }}
                >
                  Descargar PDF
                </Button>
              </div>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setQrModalOpen(false); setCopySuccess(false); setShowQR(false); }} color="primary">Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Export Modal */}
      <Dialog open={exportModalOpen} onClose={() => setExportModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <DownloadIcon style={{ color: '#28a745' }} />
            <span style={{ fontWeight: 'bold', color: '#28a745' }}>Exportar Datos</span>
          </div>
        </DialogTitle>
        <DialogContent sx={{ minHeight: 250 }}>
          <div style={{ marginTop: 16 }}>
            {/* IPRESS Selection */}
            <div className="relative mb-6" ref={dropdownRef}>
              <label className="block text-custom-blue text-sm font-bold mb-2">
                Seleccionar IPRESS<span className="text-red-500"> *</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={ipressSearch}
                  onChange={(e) => setIpressSearch(e.target.value)}
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
                <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                  <div className="p-2 border-b border-gray-200">
                    <button
                      type="button"
                      onClick={selectAllIpress}
                      className="w-full text-left px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded"
                    >
                      Seleccionar Todos
                    </button>
                  </div>
                  <ul>
                    {(ipressSearch ? filteredIpress : ipressList).map((center) => (
                      <li
                        key={center}
                        onClick={() => toggleIpress(center)}
                        className={`cursor-pointer px-4 py-2 hover:bg-indigo-100 ${
                          selectedIpress.includes(center) ? 'bg-indigo-50' : ''
                        }`}
                      >
                        {center}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedIpress.length > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-semibold">Seleccionados ({selectedIpress.length}):</p>
                    <button
                      type="button"
                      onClick={clearAllIpress}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Limpiar todos
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedIpress.map((center) => (
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
            
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Fecha de inicio"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: endDate || new Date().toISOString().split('T')[0] }}
              />
              
              <TextField
                label="Fecha de fin"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                inputProps={{ 
                  min: startDate,
                  max: new Date().toISOString().split('T')[0] 
                }}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setExportModalOpen(false);
              setSelectedIpress([]);
              setIpressSearch('');
              setStartDate('');
              setEndDate('');
            }}
            sx={{ color: '#6c757d', fontWeight: 'bold' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleExport}
            variant="contained"
            disabled={exportLoading || selectedIpress.length === 0 || !startDate || !endDate}
            sx={{ 
              backgroundColor: '#28a745', 
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#218838' },
              '&.Mui-disabled': {
                backgroundColor: '#a5d6a7',
                color: '#fff',
                opacity: 1
              }
            }}
          >
            {exportLoading ? 'Exportando...' : 'Exportar'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Children; 