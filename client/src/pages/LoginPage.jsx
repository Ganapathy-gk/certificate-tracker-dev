// client/src/pages/LoginPage.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Button, TextField, Box, Typography, Link, Grid, Paper, CssBaseline, Container, Alert } from '@mui/material';
import CollegeLogo from '../assets/college_logo.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // State for login errors
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    try {
      const userData = await login(email, password);
      
      // Navigate based on role
      if (userData.role === 'admin') navigate('/admin');
      else if (userData.role === 'classAdviser') navigate('/adviser-dashboard');
      else if (userData.role === 'hod') navigate('/hod-dashboard');
      else if (userData.role === 'principal') navigate('/principal-dashboard');
      else if (userData.role === 'officeStaff') navigate('/office-dashboard');
      else navigate('/dashboard'); // Default for student

    } catch (error) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <CssBaseline />
      <Container component={Paper} elevation={6} maxWidth="xs" sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={CollegeLogo} alt="College Logo" style={{ width: '100%', maxWidth: '350px', marginBottom: '2rem' }} />
          <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
            Welcome Back!
          </Typography>
          <Typography component="p" color="text.secondary" sx={{ mb: 2 }}>
            Enter your details to sign in to your account
          </Typography>
          
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            
            <Grid container justifyContent="flex-end" sx={{ mt: 1 }}>
              <Grid item>
                <Link component={RouterLink} to="/forgot-password" variant="body2">
                  Forgot Password?
                </Link>
              </Grid>
            </Grid>

            <Button type="submit" fullWidth variant="contained" sx={{ mt: 2, mb: 2, py: 1.5 }}>
              Login
            </Button>
            <Grid container justifyContent="center">
              <Grid item>
                <Link component={RouterLink} to="/register" variant="body2">
                  Don't have an account? Sign up
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;