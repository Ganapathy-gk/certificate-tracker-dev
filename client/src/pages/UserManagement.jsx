// client/src/pages/UserManagement.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Modal, Select, MenuItem, FormControl, InputLabel 
} from '@mui/material';
import './UserManagement.css'; // We'll create this file next

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

const UserManagement = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null); // The user object we are editing
  const [selectedRole, setSelectedRole] = useState('');
  const [deletingUser, setDeletingUser] = useState(null); // The user object for deletion confirmation
  const navigate = useNavigate();

  const fetchUsers = async () => {
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
  }, []);

  const handleEditOpen = (userToEdit) => {
    setEditingUser(userToEdit);
    setSelectedRole(userToEdit.role);
  };

  const handleEditClose = () => {
    setEditingUser(null);
  };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const handleUpdateRole = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${API_BASE_URL}/api/admin/users/${editingUser._id}`, { role: selectedRole }, config);
      alert('User role updated successfully!');
      handleEditClose();
      fetchUsers(); // Re-fetch users to show the change
    } catch (error) {
      console.error("Failed to update user role", error);
      alert('Failed to update user role.');
    }
  };
  
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
      fetchUsers(); // Re-fetch users to show the change
    } catch (error) {
      console.error("Failed to delete user", error);
      alert('Failed to delete user.');
    }
  };

  const allRoles = ['student', 'classAdviser', 'hod', 'principal', 'officeStaff', 'admin'];

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
                <TableCell>Student ID</TableCell>
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
                  <TableCell>{u.studentId || 'N/A'}</TableCell>
                  <TableCell>{u.department || 'N/A'}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell align="right">
                    <Button variant="outlined" size="small" onClick={() => handleEditOpen(u)} sx={{ mr: 1 }}>Edit Role</Button>
                    <Button variant="outlined" size="small" color="error" onClick={() => handleDeleteOpen(u)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit User Modal */}
      <Modal open={!!editingUser} onClose={handleEditClose}>
        <Box className="modal-box">
          <Typography variant="h6">Edit Role for {editingUser?.name}</Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select labelId="role-select-label" value={selectedRole} label="Role" onChange={handleRoleChange}>
              {allRoles.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </Select>
          </FormControl>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" onClick={handleEditClose}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdateRole}>Save Changes</Button>
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