import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Modal, Select, MenuItem, FormControl, InputLabel, TextField 
} from '@mui/material';
import './UserManagement.css';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

const UserManagement = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ role: '', department: '' });
  const [assigningStudent, setAssigningStudent] = useState(null);
  const [selectedAdviserId, setSelectedAdviserId] = useState('');

  // --- NEW STATE FOR FILTERS AND SEARCH ---
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  const fetchUsers = async () => { /* ... existing function ... */ };
  useEffect(() => { /* ... existing function ... */ }, [user]);
  
  // --- EXISTING HANDLER FUNCTIONS ---
  const handleEditOpen = (userToEdit) => { /* ... */ };
  const handleEditClose = () => { /* ... */ };
  const handleFormChange = (event) => { /* ... */ };
  const handleUpdateUser = async () => { /* ... */ };
  const handleDeleteOpen = (userToDelete) => { /* ... */ };
  const handleDeleteClose = () => { /* ... */ };
  const handleDeleteUser = async () => { /* ... */ };
  const handleAssignOpen = (student) => { /* ... */ };
  const handleAssignClose = () => { /* ... */ };
  const handleAssignAdviser = async () => { /* ... */ };
  
  const allRoles = ['student', 'classAdviser', 'hod', 'principal', 'officeStaff', 'admin'];
  const allDepartments = ["CSE", "ECE", "IT", "EEE", "Civil", "Mech", "All"];
  const advisers = users.filter(u => u.role === 'classAdviser');

  // --- NEW LOGIC TO FILTER AND SORT USERS ---
  const filteredAndSortedUsers = useMemo(() => {
    return users
      .filter(u => {
        // Department Filter
        if (departmentFilter !== 'All' && u.department !== departmentFilter) {
          return false;
        }
        // Search Term Filter
        const term = searchTerm.toLowerCase();
        if (term && !(
          u.name.toLowerCase().includes(term) ||
          u.studentId?.toLowerCase().includes(term)
        )) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Sorting Logic: students go to the bottom
        const roleA = a.role === 'student' ? 1 : 0;
        const roleB = b.role === 'student' ? 1 : 0;
        return roleA - roleB;
      });
  }, [users, searchTerm, departmentFilter]);

  return (
    <Box className="user-management-container">
      <Button variant="contained" onClick={() => navigate('/admin')} sx={{ mb: 2 }}>
        &larr; Back to Dashboard
      </Button>

      {/* --- NEW FILTER AND SEARCH CONTROLS --- */}
      <Paper elevation={3} sx={{ p: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Search by Name or ID"
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Department</InputLabel>
          <Select
            value={departmentFilter}
            label="Department"
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            {allDepartments.map(dept => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
          </Select>
        </FormControl>
      </Paper>
      
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
              {/* Use the new filtered and sorted list */}
              {filteredAndSortedUsers.map((u) => (
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