import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Modal, TextareaAutosize } from '@mui/material';
import Clock from '../components/Clock';
import '../pages/AdminDashboard.css'; // Reusing admin styles

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

const PrincipalDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionComment, setActionComment] = useState('');

  const fetchRequests = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_BASE_URL}/api/certificates/all`, config);
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch requests", error);
    }
  };

  useEffect(() => {
    if(user) fetchRequests();
  }, [user]);

  const handleProcessClick = (request) => {
    setSelectedRequest(request);
    setActionComment('');
  };

  const handleProcessRequest = async (action) => {
    if (action === 'reject' && !actionComment.trim()) {
      alert('A comment is required to reject a request.');
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = { action, comment: actionComment };
      await axios.put(`${API_BASE_URL}/api/certificates/${selectedRequest._id}/process`, payload, config);
      alert('Request processed successfully!');
      setSelectedRequest(null);
      fetchRequests();
    } catch (error)
      {
      alert(error.response?.data?.message || 'Failed to process request.');
    }
  };
  
  // CLIENT-SIDE FILTER: Show only requests waiting for Principal approval
  const actionableRequests = requests.filter(req => req.status === 'Pending Principal Approval');

  return (
    <Box>
      <header className="dashboard-header admin-header">
        <Typography variant="h4" component="h2" sx={{color: 'white'}}>Principal Panel</Typography>
        <div className="header-right">
          <Clock />
          <div className="header-user-info">
            <span>Welcome, {user?.name}! (Principal)</span>
            <button onClick={logout} className="logout-button">Logout</button>
          </div>
        </div>
      </header>
      <main className="user-management-container">
        <Paper elevation={3}>
          <TableContainer>
            <Typography variant="h5" sx={{ p: 2 }}>Action Required</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Certificate Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {actionableRequests.map((req) => (
                  <TableRow key={req._id}>
                    <TableCell>{req.student?.name || 'N/A'}</TableCell>
                    <TableCell>{req.certificateType}</TableCell>
                    <TableCell><span className={`status-badge status-${req.status.toLowerCase().replace(/\s+/g, '-')}`}>{req.status}</span></TableCell>
                    <TableCell align="right">
                      <Button variant="outlined" onClick={() => handleProcessClick(req)}>Process</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </main>

      {/* Process Request Modal */}
      {selectedRequest && (
        <Modal open={!!selectedRequest} onClose={() => setSelectedRequest(null)}>
          <Box className="modal-box">
            <Typography variant="h6">Process Request</Typography>
            <Typography sx={{ mt: 2 }}><b>Student:</b> {selectedRequest.student?.name}</Typography>
            <Typography><b>Certificate:</b> {selectedRequest.certificateType}</Typography>
            <Typography><b>Purpose:</b> {selectedRequest.purpose}</Typography>
            <TextareaAutosize
              minRows={3}
              placeholder="Comment (Required for rejection)"
              style={{ width: '100%', marginTop: '1rem', padding: '0.5rem' }}
              value={actionComment}
              onChange={(e) => setActionComment(e.target.value)}
            />
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button variant="outlined" onClick={() => setSelectedRequest(null)}>Cancel</Button>
              <Button variant="contained" color="error" onClick={() => handleProcessRequest('reject')}>Reject</Button>
              <Button variant="contained" color="success" onClick={() => handleProcessRequest('approve')}>Approve</Button>
            </Box>
          </Box>
        </Modal>
      )}
    </Box>
  );
};

export default PrincipalDashboard;