import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { Button, TextField, Box, Typography, Link, Grid, Paper, CssBaseline, FormControl, InputLabel, Select, MenuItem, Container } from '@mui/material';

// Import your college logo
import CollegeLogo from '../assets/college_logo.png';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name, email, studentId, department, password, role: 'student',
      });
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4, // Add padding for smaller screens where form might be long
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      <CssBaseline />
      <Container component={Paper} elevation={6} maxWidth="xs" sx={{ p: 4, borderRadius: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <img src={CollegeLogo} alt="College Logo" style={{ width: '100%', maxWidth: '350px', marginBottom: '2rem' }} />
          <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
            Create Your Account
          </Typography>
          <Typography component="p" color="text.secondary" sx={{ mb: 2 }}>
            Get started by filling out the details below
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField margin="normal" required fullWidth id="name" label="Full Name" name="name" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField margin="normal" required fullWidth id="email" label="Email Address" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField margin="normal" required fullWidth id="studentId" label="Student ID" name="studentId" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
            <FormControl fullWidth margin="normal">
              <InputLabel id="department-label">Department</InputLabel>
              <Select labelId="department-label" id="department" value={department} label="Department" onChange={(e) => setDepartment(e.target.value)}>
                <MenuItem value="CSE">CSE</MenuItem>
                <MenuItem value="ECE">ECE</MenuItem>
                <MenuItem value="IT">IT</MenuItem>
                <MenuItem value="EEE">EEE</MenuItem>
                <MenuItem value="Civil">Civil</MenuItem>
                <MenuItem value="Mech">Mech</MenuItem>
              </Select>
            </FormControl>
            <TextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, py: 1.5 }}>
              Sign Up
            </Button>
            <Grid container justifyContent="center">
              <Grid item>
                <Link component={RouterLink} to="/login" variant="body2">
                  Already have an account? Sign In
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default RegisterPage;