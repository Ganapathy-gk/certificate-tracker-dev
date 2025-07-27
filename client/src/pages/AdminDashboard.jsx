import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Clock from '../components/Clock';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;
  const { user, logout } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [rejectionComment, setRejectionComment] = useState('');

  // State variables for filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchAllRequests = async () => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_BASE_URL}/api/certificates/all`, config);
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch requests', error);
    }
  };

  useEffect(() => {
    fetchAllRequests();
  }, [user]);

  const handleUpdateClick = (request) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setRejectionComment('');
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
        const config = {
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        };
        const comment = newStatus === 'Rejected' ? rejectionComment : `Status updated to ${newStatus}`;
        await axios.put(`${API_BASE_URL}/api/certificates/${selectedRequest._id}/update-status`, { status: newStatus, comment: comment }, config);
        alert('Status updated successfully!');
        setSelectedRequest(null);
        fetchAllRequests();
    } catch (error) {
        alert('Failed to update status.');
        console.error(error);
    }
  };

  const filteredRequests = requests.filter(req => {
    const studentName = req.student?.name?.toLowerCase() || '';
    const studentId = req.student?.studentId?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();

    const matchesSearch = studentName.includes(search) || studentId.includes(search);
    const matchesStatus = filterStatus === 'All' || req.status === filterStatus;
    const matchesType = filterType === 'All' || req.certificateType === filterType;

    const requestDate = new Date(req.createdAt);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if(start) start.setHours(0,0,0,0);
    if(end) end.setHours(23,59,59,999);
    const matchesDate = (!start || requestDate >= start) && (!end || requestDate <= end);

    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Certificate Requests Report", 14, 16);
    doc.autoTable({
      head: [['Student Name', 'Student ID', 'Department', 'Certificate Type', 'Status', 'Applied Date']],
      body: filteredRequests.map(req => [
        req.student?.name,
        req.student?.studentId,
        req.student?.department,
        req.certificateType,
        req.status,
        new Date(req.createdAt).toLocaleDateString()
      ]),
      startY: 20,
    });
    doc.save('certificate-requests.pdf');
  };

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
                <option value="Rejected">Rejected</option>
            </select>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="All">All Types</option>
                <option value="Bonafide">Bonafide</option>
                <option value="Transfer Certificate">Transfer Certificate</option>
                <option value="Marksheet Copy">Marksheet Copy</option>
            </select>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <button className="export-button" onClick={exportToPDF}>Export PDF</button>
          </div>

          <div className="requests-table-container">
            <h3>All Certificate Requests</h3>
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Department</th>
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
                    <td>{req.student?.department || 'N/A'}</td>
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

      {selectedRequest && (
         <div className="modal-overlay">
            <div className="modal-content">
                <h3>Request Details</h3>
                <p><strong>Student:</strong> {selectedRequest.student?.name}</p>
                <p><strong>Certificate:</strong> {selectedRequest.certificateType}</p>
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
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                    {newStatus === 'Rejected' && (
                        <div className="form-group">
                            <label htmlFor="rejection-comment">Rejection Reason (Required)</label>
                            <textarea 
                                id="rejection-comment" 
                                value={rejectionComment} 
                                onChange={(e) => setRejectionComment(e.target.value)} 
                                required
                                placeholder="Provide a reason for rejection..."
                            ></textarea>
                        </div>
                    )}
                    <div className="modal-actions">
                        <button type="submit" className="submit-button">Update Status</button>
                        <button type="button" className="cancel-button" onClick={() => setSelectedRequest(null)}>Cancel</button>
                    </div>
                </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default AdminDashboard; // Corrected typo here