import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Modal, Select, MenuItem, FormControl, InputLabel 
} from '@mui/material';
import './UserManagement.css';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

const UserManagement = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const navigate = useNavigate();

  // State for the main edit form
  const [formData, setFormData] = useState({ role: '', department: '' });

  // State for the assign adviser modal
  const [assigningStudent, setAssigningStudent] = useState(null);
  const [selectedAdviserId, setSelectedAdviserId] = useState('');

  const fetchUsers = async () => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_BASE_URL}/api/admin/users`, config);
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  // --- Edit User Functions ---
  const handleEditOpen = (userToEdit) => {
    setEditingUser(userToEdit);
    setFormData({ role: userToEdit.role, department: userToEdit.department || '' });
  };

  const handleEditClose = () => {
    setEditingUser(null);
  };

  const handleFormChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleUpdateUser = async () => {
    try {
      const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` } };
      await axios.put(`${API_BASE_URL}/api/admin/users/${editingUser._id}`, formData, config);
      alert('User updated successfully!');
      handleEditClose();
      fetchUsers();
    } catch (error) {
      console.error("Failed to update user", error);
      alert('Failed to update user.');
    }
  };
  
  // --- Delete User Functions ---
  const handleDeleteOpen = (userToDelete) => {
    setDeletingUser(userToDelete);
  };

  const handleDeleteClose = () => {
    setDeletingUser(null);
  };

  const handleDeleteUser = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`${API_BASE_URL}/api/admin/users/${deletingUser._id}`, config);
      alert('User deleted successfully!');
      handleDeleteClose();
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user", error);
      alert('Failed to delete user.');
    }
  };

  // --- Assign Adviser Functions ---
  const handleAssignOpen = (student) => {
    setAssigningStudent(student);
  };

  const handleAssignClose = () => {
    setAssigningStudent(null);
    setSelectedAdviserId('');
  };

  const handleAssignAdviser = async () => {
    if (!selectedAdviserId) {
      alert('Please select an adviser.');
      return;
    }
    try {
      const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` } };
      const payload = { studentId: assigningStudent._id, adviserId: selectedAdviserId };
      await axios.put(`${API_BASE_URL}/api/auth/assign-adviser`, payload, config);
      alert('Adviser assigned successfully!');
      handleAssignClose();
    } catch (error) {
      console.error('Failed to assign adviser', error);
      alert('Failed to assign adviser.');
    }
  };

  const allRoles = ['student', 'classAdviser', 'hod', 'principal', 'officeStaff', 'admin'];
  const allDepartments = ["CSE", "ECE", "IT", "EEE", "Civil", "Mech"];
  const advisers = users.filter(u => u.role === 'classAdviser');

  return (
    <Box className="user-management-container">
      <Button variant="contained" onClick={() => navigate('/admin')} sx={{ mb: 2 }}>
        &larr; Back to Dashboard
      </Button>
      <Paper elevation={3}>
        <TableContainer>
          <Typography variant="h5" sx={{ p: 2 }}>User Management</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Role</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.department || 'N/A'}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell align="right">
                    {u.role === 'student' && (
                      <Button variant="outlined" size="small" color="secondary" onClick={() => handleAssignOpen(u)} sx={{ mr: 1 }}>
                        Assign Adviser
                      </Button>
                    )}
                    <Button variant="outlined" size="small" onClick={() => handleEditOpen(u)} sx={{ mr: 1 }}>Edit</Button>
                    <Button variant="outlined" size="small" color="error" onClick={() => handleDeleteOpen(u)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Assign Adviser Modal */}
      <Modal open={!!assigningStudent} onClose={handleAssignClose}>
        <Box className="modal-box">
          <Typography variant="h6">Assign Adviser to {assigningStudent?.name}</Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="adviser-select-label">Select Adviser</InputLabel>
            <Select
              labelId="adviser-select-label"
              value={selectedAdviserId}
              label="Select Adviser"
              onChange={(e) => setSelectedAdviserId(e.target.value)}
            >
              {advisers.length > 0 ? (
                advisers.map(adviser => (
                  <MenuItem key={adviser._id} value={adviser._id}>{adviser.name}</MenuItem>
                ))
              ) : (
                <MenuItem disabled>No advisers found</MenuItem>
              )}
            </Select>
          </FormControl>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" onClick={handleAssignClose}>Cancel</Button>
            <Button variant="contained" onClick={handleAssignAdviser}>Assign</Button>
          </Box>
        </Box>
      </Modal>

      {/* Edit User Modal */}
      <Modal open={!!editingUser} onClose={handleEditClose}>
        <Box className="modal-box">
          <Typography variant="h6">Edit User: {editingUser?.name}</Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select name="role" labelId="role-select-label" value={formData.role} label="Role" onChange={handleFormChange}>
              {allRoles.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="dept-select-label">Department</InputLabel>
            <Select name="department" labelId="dept-select-label" value={formData.department} label="Department" onChange={handleFormChange}>
              {allDepartments.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </Select>
          </FormControl>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" onClick={handleEditClose}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdateUser}>Save Changes</Button>
          </Box>
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deletingUser} onClose={handleDeleteClose}>
        <Box className="modal-box">
          <Typography variant="h6">Confirm Deletion</Typography>
          <Typography sx={{ mt: 2 }}>
            Are you sure you want to delete the user "{deletingUser?.name}"? This action cannot be undone.
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" onClick={handleDeleteClose}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDeleteUser}>Delete User</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default UserManagement;