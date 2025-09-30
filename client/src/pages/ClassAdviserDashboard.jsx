import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Modal, TextareaAutosize, Link } from '@mui/material';
import Clock from '../components/Clock';
import '../pages/AdminDashboard.css';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

const ClassAdviserDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionComment, setActionComment] = useState('');

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_BASE_URL}/api/certificates/all`, config);
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch requests", error);
    }
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

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
      const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` } };
      const payload = { action, comment: actionComment };
      
      // 1. Make the API call as before
      await axios.put(`${API_BASE_URL}/api/certificates/${selectedRequest._id}/process`, payload, config);

      // 2. THE FIX: Immediately remove the processed request from the UI state
      setRequests(currentRequests =>
        currentRequests.filter(req => req._id !== selectedRequest._id)
      );
      
      // 3. Close the modal
      setSelectedRequest(null);

      // 4. Show the success message
      alert('Request processed successfully!');

    } catch (error) {
      alert(error.response?.data?.message || 'Failed to process request.');
    }
  };
  
  const actionableRequests = requests.filter(req => req.status === 'Pending Adviser Approval');

  return (
    <Box>
      <header className="dashboard-header admin-header">
        <Typography variant="h4" component="h2" sx={{color: 'white'}}>Adviser Panel</Typography>
        <div className="header-right">
          <Clock />
          <div className="header-user-info">
            <span>Welcome, {user?.name}! (Adviser)</span>
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
                  <TableCell>Document</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {actionableRequests.map((req) => (
                  <TableRow key={req._id}>
                    <TableCell>{req.student?.name || 'N/A'}</TableCell>
                    <TableCell>{req.certificateType}</TableCell>
                    <TableCell>
                      {req.documentUrl ? (<Link href={req.documentUrl} target="_blank" rel="noopener noreferrer">View</Link>) : ('None')}
                    </TableCell>
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

      {selectedRequest && (
        <Modal open={!!selectedRequest} onClose={() => setSelectedRequest(null)}>
          <Box className="modal-box">
            <Typography variant="h6">Process Request</Typography>
            <Typography sx={{ mt: 2 }}><b>Student:</b> {selectedRequest.student?.name}</Typography>
            <Typography><b>Certificate:</b> {selectedRequest.certificateType}</Typography>
            {/* --- ADDED LINE --- */}
            <Typography><b>Applied on:</b> {new Date(selectedRequest.createdAt).toLocaleDateString()}</Typography>
            <Typography><b>Purpose:</b> {selectedRequest.purpose}</Typography>
            {selectedRequest.documentUrl && (
              <Typography>
                <b>Document:</b> <Link href={selectedRequest.documentUrl} target="_blank" rel="noopener noreferrer">View Document</Link>
              </Typography>
            )}
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

export default ClassAdviserDashboard;