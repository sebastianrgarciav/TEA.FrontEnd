import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Avatar,
  Divider,
  Button,
  Container,
  CircularProgress,
} from '@mui/material';
import { Email, Lock } from '@mui/icons-material';
import Swal from 'sweetalert2';
import ProfileService from '../services/profileService';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [profile, setProfile] = useState({
    id: '',
    name: '',
    firstLastName: '',
    secondLastName: '',
    email: '',
    phone: '',
    role: '',
    ipress: '',
    dni: ''
  });
  const [loading, setLoading] = useState(false);

  // Local state for password update
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Retrieve from sessionStorage (keys: userId, token, user)
  const userId = sessionStorage.getItem('userId') || '';
  const userName = sessionStorage.getItem('user') || '';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        console.error('No userId found in session storage!');
        return;
      }
      try {
        const response = await ProfileService.getProfile(userId);
        // Se asume que response.data contiene: id, name, firstLastName, secondLastName, email, phone, role, ipress
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
      }
    };

    fetchProfile();
  }, [userId]);

  const handleUpdateAccount = async () => {
    const result = await Swal.fire({
      title: 'Confirmar actualización',
      text: '¿Está seguro de actualizar la información del perfil?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        // Se envían solo los campos editables (excluyendo role y ipress)
        const updatedData = {
          id: profile.id,
          name: profile.name,
          firstLastName: profile.firstLastName,
          email: profile.email,
          role: profile.role,
          dni: profile.dni,
          secondLastName: profile.secondLastName,
          phone: profile.phone,
          password: ''
        };
        await ProfileService.updateProfile(updatedData);
        await Swal.fire('Éxito', 'Perfil actualizado exitosamente', 'success');
      } catch (error) {
        console.error('Error updating profile:', error);
        await Swal.fire('Error', 'Error al actualizar el perfil', 'error');
      }
    }
  };

  const handleUpdatePassword = async () => {
    if (password !== confirmPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
      return;
    }
    if (!userId) {
      Swal.fire('Error', 'No hay userId en sessionStorage', 'error');
      return;
    }
    const result = await Swal.fire({
      title: 'Confirmar actualización de contraseña',
      text: '¿Está seguro de actualizar la contraseña?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await ProfileService.updatePassword(userId, password);
        navigate('/login');
        await Swal.fire('Éxito', 'Contraseña actualizada exitosamente', 'success');
        setPassword('');
        setConfirmPassword('');
      } catch (error) {
        console.error('Error updating password:', error);
        await Swal.fire('Error', 'Error al actualizar la contraseña', 'error');
      }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ my: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', mt: 10 }}>
        Perfil
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '360px auto' },
          alignItems: 'stretch',
          gap: 2,
        }}
      >
        {/* LEFT COLUMN */}
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* TOP CARD: Profile photo and name */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                <Avatar
                  alt="Profile"
                  src="/profile.png"
                  sx={{ width: 120, height: 120, mb: 2 }}
                />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {profile.name + ' ' + profile.firstLastName || userName}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* BOTTOM CARD: Password update */}
          <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Contraseña
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Actualizar contraseña
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    type="password"
                    label="Contraseña"
                    variant="outlined"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#01723E',
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#01723E',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    type="password"
                    label="Contraseña (Confirmar)"
                    variant="outlined"
                    fullWidth
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#01723E',
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#01723E',
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button
                startIcon={<Lock />}
                variant="contained"
                onClick={handleUpdatePassword}
                className='bg-custom-blue'
                sx={{
                  backgroundColor: '#01723E',
                  '&:hover': { backgroundColor: '#015f33' },
                }}
              >
                Actualizar
              </Button>
            </CardActions>
          </Card>
        </Box>

        {/* RIGHT COLUMN */}
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Cuenta
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Información del perfil
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="DNI"
                  variant="outlined"
                  value={profile.dni}
                  disabled
                  fullWidth
                />
                <TextField
                  label="Nombre(s)"
                  variant="outlined"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#01723E',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#01723E',
                    },
                  }}
                />
                <TextField
                  label="Apellido Paterno"
                  variant="outlined"
                  value={profile.firstLastName}
                  onChange={(e) => setProfile({ ...profile, firstLastName: e.target.value })}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#01723E',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#01723E',
                    },
                  }}
                />
                <TextField
                  label="Apellido Materno"
                  variant="outlined"
                  value={profile.secondLastName}
                  onChange={(e) => setProfile({ ...profile, secondLastName: e.target.value })}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#01723E',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#01723E',
                    },
                  }}
                />
                <TextField
                  label="Rol"
                  variant="outlined"
                  value={profile.role}
                  disabled
                  fullWidth
                />
                {/* Renderiza el campo de IPRESS solo si ipress NO está vacío */}
                {profile.ipress && (
                  <>
                    <TextField
                      label="IPRESS"
                      variant="outlined"
                      value={profile.ipress?.split('\n').join(', ')}
                      disabled
                      fullWidth
                    />
                  </>
                )}
                <TextField
                  label="Correo Electrónico"
                  variant="outlined"
                  value={profile.email}
                  disabled
                  fullWidth
                  InputProps={{ style: { color: '#999' } }}
                />
                <TextField
                  label="Número de celular"
                  variant="outlined"
                  value={profile.phone}
                  type="number"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,9}$/.test(value)) {
                      setProfile({ ...profile, phone: value });
                    }
                  }}
                  fullWidth
                  inputProps={{ maxLength: 9 }}
                  sx={{
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#01723E',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#01723E',
                    },
                  }}
                />

              </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button
                startIcon={<Lock />}
                className='bg-custom-blue'
                variant="contained"
                onClick={handleUpdateAccount}
                sx={{ backgroundColor: '#01723E', '&:hover': { backgroundColor: '#015f33' } }}
              >
                Actualizar
              </Button>
            </CardActions>
          </Card>
        </Box>
      </Box>
    </Container>
  );
}

export default Profile;
