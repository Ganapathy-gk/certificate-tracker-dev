import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Clock from '../components/Clock';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;
  const { user, logout } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  // State variables for filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');

  const fetchAllRequests = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`${API_BASE_URL}/api/certificates/all`, config);
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch requests', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllRequests();
    }
  }, [user]);

  const handleUpdateClick = (request) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`,
            },
        };
        await axios.put(`${API_BASE_URL}/api/certificates/${selectedRequest._id}/update-status`, { status: newStatus }, config);
        alert('Status updated successfully!');
        setSelectedRequest(null);
        fetchAllRequests(); // Refresh the list
    } catch (error) {
        alert('Failed to update status.');
        console.error(error);
    }
  };

  // This logic filters the requests before they are displayed
  const filteredRequests = requests.filter(req => {
    const studentName = req.student?.name?.toLowerCase() || '';
    const studentId = req.student?.studentId?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();

    const matchesSearch = studentName.includes(search) || studentId.includes(search);
    const matchesStatus = filterStatus === 'All' || req.status === filterStatus;
    const matchesType = filterType === 'All' || req.certificateType === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="dashboard-page">
      <header className="dashboard-header admin-header">
        <h2>CertTrack - Admin Panel</h2>
        <div className="header-right">
          <Clock />
          <div className="header-user-info">
            <span>Welcome, {user?.name}! (Admin)</span>
            <button onClick={logout} className="logout-button">Logout</button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="admin-main-content" style={{width: '100%'}}>
          <div className="filter-container">
            <input 
                type="text"
                placeholder="Search by Student Name or ID..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Requested">Requested</option>
                <option value="In Process">In Process</option>
                <option value="Ready">Ready</option>
                <option value="Collected">Collected</option>
            </select>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="All">All Types</option>
                <option value="Bonafide">Bonafide</option>
                <option value="Transfer Certificate">Transfer Certificate</option>
                <option value="Marksheet Copy">Marksheet Copy</option>
            </select>
          </div>

          <div className="requests-table-container">
            <h3>All Certificate Requests</h3>
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Certificate Type</th>
                  <th>Document</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req._id}>
                    <td>{req.student?.name || 'N/A'}</td>
                    <td>{req.student?.studentId || 'N/A'}</td>
                    <td>{req.certificateType}</td>
                    <td>
                        {req.documentUrl ? (
                            <a href={req.documentUrl} target="_blank" rel="noopener noreferrer" className="action-button download-button">View</a>
                        ) : ('None')}
                    </td>
                    <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td><span className={`status-badge status-${req.status.toLowerCase().replace(/\s+/g, '-')}`}>{req.status}</span></td>
                    <td>
                      <button className="action-button" onClick={() => handleUpdateClick(req)}>Update</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ===== START OF UPDATED MODAL CODE ===== */}
      {selectedRequest && (
         <div className="modal-overlay">
            <div className="modal-content">
                <h3>Request Details</h3>
                <p><strong>Student:</strong> {selectedRequest.student?.name}</p>
                <p><strong>Certificate:</strong> {selectedRequest.certificateType}</p>
                
                {/* ADDED: Purpose and Notes */}
                <p className="request-details"><strong>Purpose:</strong> {selectedRequest.purpose}</p>
                {selectedRequest.notes && <p className="request-details"><strong>Notes:</strong> {selectedRequest.notes}</p>}
                
                <hr className="divider" />
                
                <form onSubmit={handleStatusUpdate}>
                    <h4 className="update-status-header">Update Status</h4>
                    <div className="form-group">
                        <label htmlFor="status-select">New Status</label>
                        <select id="status-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                            <option value="Requested">Requested</option>
                            <option value="In Process">In Process</option>
                            <option value="Signed by HOD">Signed by HOD</option>
                            <option value="Principal Approval">Principal Approval</option>
                            <option value="Ready">Ready</option>
                            <option value="Collected">Collected</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="submit-button">Update Status</button>
                        <button type="button" className="cancel-button" onClick={() => setSelectedRequest(null)}>Cancel</button>
                    </div>
                </form>
            </div>
         </div>
      )}
      {/* ===== END OF UPDATED MODAL CODE ===== */}
    </div>
  );
};

export default AdminDashboard;