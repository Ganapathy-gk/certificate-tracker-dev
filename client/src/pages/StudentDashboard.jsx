import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Clock from '../components/Clock';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);

  // State for the form fields
  const [certificateType, setCertificateType] = useState('Bonafide');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [document, setDocument] = useState(null); // New state for the file

  const statusSteps = ['Requested', 'In Process', 'Signed by HOD', 'Principal Approval', 'Ready'];
  
  const getProgress = (currentStatus) => {
    const currentIndex = statusSteps.indexOf(currentStatus);
    if (currentStatus === 'Collected') return 100;
    return ((currentIndex + 1) / statusSteps.length) * 100;
  };

  const fetchRequests = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5001/api/certificates/my-requests', config);
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch requests', error);
    }
  };

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    
    // Use FormData to send file and text data together
    const formData = new FormData();
    formData.append('certificateType', certificateType);
    formData.append('purpose', purpose);
    formData.append('notes', notes);
    if (document) {
      formData.append('document', document);
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file uploads
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.post('http://localhost:5001/api/certificates/request', formData, config);
      
      alert('Request submitted successfully!');
      fetchRequests(); // Re-fetch requests
      // Reset form
      setPurpose('');
      setNotes('');
      setDocument(null);
      document.getElementById('document').value = null; // Clear file input
    } catch (error) {
      alert('Failed to submit request.');
      console.error(error);
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h2>CertTrack</h2>
        <div className="header-right">
          <Clock />
          <div className="header-user-info">
            <span>Welcome, {user?.name}!</span>
            <button onClick={logout} className="logout-button">Logout</button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="form-container student-form">
          <h3>Apply for Certificate</h3>
          <form onSubmit={handleRequestSubmit}>
            <div className="form-group">
              <label htmlFor="cert-type">Certificate Type</label>
              <select id="cert-type" value={certificateType} onChange={(e) => setCertificateType(e.target.value)}>
                <option value="Bonafide">Bonafide</option>
                <option value="Transfer Certificate">Transfer Certificate</option>
                <option value="Marksheet Copy">Marksheet Copy</option>
              </select>
            </div>
            <div className="form-group">
                <label htmlFor="purpose">Purpose</label>
                <textarea id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} required placeholder="Enter the purpose for this certificate"></textarea>
            </div>
            <div className="form-group">
                <label htmlFor="document">Supporting Document (PDF, PNG, JPG - max 1MB)</label>
                <input type="file" id="document" onChange={(e) => setDocument(e.target.files[0])} />
            </div>
            <div className="form-group">
                <label htmlFor="notes">Additional Notes (Optional)</label>
                <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional information"></textarea>
            </div>
            <button type="submit" className="submit-button">Submit Application</button>
          </form>
        </div>

        <div className="requests-container">
          <h3>Your Certificate Requests</h3>
          <div className="requests-list">
            {requests.length > 0 ? (
              requests.map((req) => (
                <div key={req._id} className="request-card student-card">
                  <div className="card-header">
                    <h4>{req.certificateType}</h4>
                    <span className={`status-pill status-${req.status.toLowerCase().replace(/\s+/g, '-')}`}>{req.status}</span>
                  </div>
                  <p className="purpose-text"><strong>Purpose:</strong> {req.purpose}</p>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${getProgress(req.status)}%` }}></div>
                  </div>
                  <p className="applied-date">Applied on: {new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <p>You have no active requests.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;