import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Clock from '../components/Clock';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Sector } from 'recharts';
import { Button } from '@mui/material';
import './AdminDashboard.css';

const STATUSES = [
  'Pending Adviser Approval', 'Pending HOD Approval', 'Pending Principal Approval',
  'Ready for Collection', 'Collected', 'Rejected'
];

// Custom component for the interactive slice of the pie chart
const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      {/* UPDATED: Show the COUNT in the middle of the donut */}
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#333" fontSize="2rem" fontWeight="bold">
        {value}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#999" fontSize="1rem">
        Requests
      </text>
      <Sector
        cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius}
        startAngle={startAngle} endAngle={endAngle} fill={fill}
      />
      <Sector
        cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle}
        innerRadius={outerRadius + 6} outerRadius={outerRadius + 10} fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      {/* Show the full name in the pop-out label */}
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{payload.name}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};


const AdminDashboard = () => {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;
  const { user, logout } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionComment, setActionComment] = useState('');
  const [stats, setStats] = useState({ users: 0, requests: 0, statusCounts: {} });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const fetchData = async () => {
    if (!user) return;
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    try {
      const [requestsRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/certificates/all`, config),
        axios.get(`${API_BASE_URL}/api/admin/stats`, config)
      ]);
      setRequests(requestsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleUpdateClick = (request) => {
    setSelectedRequest(request);
    setActionComment('');
  };

  const handleProcessRequest = async (e, action) => {
    e.preventDefault();
    if (!selectedRequest) return;
    if (action === 'reject' && !actionComment.trim()) {
      alert('A comment is required to reject a request.');
      return;
    }
    try {
      const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` } };
      const payload = { action, comment: actionComment };
      await axios.put(`${API_BASE_URL}/api/certificates/${selectedRequest._id}/process`, payload, config);
      alert('Request processed successfully!');
      setSelectedRequest(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to process request.');
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
    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);
    const matchesDate = (!start || requestDate >= start) && (!end || requestDate <= end);
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Certificate Requests Report", 14, 16);
    autoTable(doc, {
      head: [['Student Name', 'Student ID', 'Department', 'Certificate Type', 'Status', 'Applied Date']],
      body: filteredRequests.map(req => [
        req.student?.name || 'N/A', req.student?.studentId || 'N/A', req.student?.department || 'N/A',
        req.certificateType, req.status, new Date(req.createdAt).toLocaleDateString()
      ]),
      startY: 20,
    });
    doc.save('certificate-requests.pdf');
  };

  const pieChartData = Object.entries(stats.statusCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

  return (
    <div className="dashboard-page">
      <header className="dashboard-header admin-header">
        <h2>CertTrack - Admin Panel</h2>
        <div className="header-right">
          <Button component={Link} to="/user-management" variant="contained" style={{backgroundColor: '#fff', color: '#343a40'}}>
            Manage Users
          </Button>
          <Clock />
          <div className="header-user-info">
            <span>Welcome, {user?.name}! (Admin)</span>
            <button onClick={logout} className="logout-button">Logout</button>
          </div>
        </div>
      </header>

      <div className="stats-container">
        <div className="stat-card"><h4>Total Users</h4><p>{stats.users}</p></div>
        <div className="stat-card"><h4>Total Requests</h4><p>{stats.requests}</p></div>
        <div className="stat-card"><h4>Pending Requests</h4><p>{(stats.statusCounts['Pending Adviser Approval'] || 0) + (stats.statusCounts['Pending HOD Approval'] || 0) + (stats.statusCounts['Pending Principal Approval'] || 0)}</p></div>
        <div className="stat-card"><h4>Requests Ready</h4><p>{stats.statusCounts['Ready for Collection'] || 0}</p></div>
      </div>
      
      <main className="dashboard-main">
        <div className="chart-container">
          <h3>Requests by Status</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                onMouseEnter={onPieEnter}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ right: -10, top: '20%' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="admin-main-content">
          <div className="filter-container">
            <input type="text" placeholder="Search by Student Name or ID..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              {STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="All">All Types</option><option value="Bonafide">Bonafide</option><option value="Transfer Certificate">Transfer Certificate</option><option value="Marksheet Copy">Marksheet Copy</option>
            </select>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <button className="export-button" onClick={exportToPDF}>Export PDF</button>
          </div>
          <div className="requests-table-container">
            <h3>All Certificate Requests</h3>
            <table>
              <thead><tr><th>Student Name</th><th>Student ID</th><th>Department</th><th>Certificate Type</th><th>Document</th><th>Applied Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req._id}>
                    <td>{req.student?.name || 'N/A'}</td><td>{req.student?.studentId || 'N/A'}</td><td>{req.student?.department || 'N/A'}</td><td>{req.certificateType}</td>
                    <td>{req.documentUrl ? (<a href={req.documentUrl} target="_blank" rel="noopener noreferrer" className="action-button download-button">View</a>) : ('None')}</td>
                    <td>{new Date(req.createdAt).toLocaleDateString()}</td><td><span className={`status-badge status-${req.status.toLowerCase().replace(/\s+/g, '-')}`}>{req.status}</span></td>
                    <td><button className="action-button" onClick={() => handleUpdateClick(req)}>Process</button></td>
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
            <h3>Process Request</h3>
            <p><strong>Student:</strong> {selectedRequest.student?.name}</p><p><strong>Certificate:</strong> {selectedRequest.certificateType}</p><p><strong>Current Status:</strong> {selectedRequest.status}</p>
            <p className="request-details"><strong>Purpose:</strong> {selectedRequest.purpose}</p>
            {selectedRequest.notes && <p className="request-details"><strong>Notes:</strong> {selectedRequest.notes}</p>}
            <hr className="divider" />
            <form onSubmit={(e) => e.preventDefault()}>
              <h4 className="update-status-header">Action</h4>
               <div className="form-group"><label htmlFor="action-comment">Comment (Required for rejection)</label><textarea id="action-comment" value={actionComment} onChange={(e) => setActionComment(e.target.value)} placeholder="Provide a comment if necessary..."></textarea></div>
              <div className="modal-actions">
                <button type="button" className="action-button approve" onClick={(e) => handleProcessRequest(e, 'approve')}>Approve</button>
                <button type="button" className="action-button reject" onClick={(e) => handleProcessRequest(e, 'reject')}>Reject</button>
                <button type="button" className="cancel-button" onClick={() => setSelectedRequest(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;