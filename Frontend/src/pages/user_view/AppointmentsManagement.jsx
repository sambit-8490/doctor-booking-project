import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Header from "../../components/Header.jsx";
import Sidebar from "../../components/Sidebar.jsx";
// import './AppointmentsManagement.css'; // Assuming you have a CSS file for this component

function AppointmentsManagement() {
  const [appointments, setAppointments] = useState([]);
  const [user, setUser] = useState(null); // Add state for user
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null); // Add state for error handling

  useEffect(() => {
    fetchData();
  }, [currentPage, filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        setError("You are not authorized. Please log in.");
        setLoading(false);
        return;
      }

      // Fetch user data
      const userResponse = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userResponse.json();
      setUser(userData.user);

      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });

      if (filter !== 'all') {
        params.append('status', filter);
      }

      const response = await fetch(`/api/appointments?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAppointments(data.appointments);
        setTotalPages(data.totalPages);
      } else {
        setError(data.msg || "Failed to fetch appointments.");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      setUpdating(appointmentId);
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert("Authentication token not found. Please log in.");
        return;
      }

      const response = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAppointments(appointments.map(appointment => 
          appointment._id === appointmentId 
            ? { ...appointment, status: newStatus }
            : appointment
        ));
      } else {
        alert(`Failed to update appointment: ${data.msg}`);
      }
    } catch (err) {
      console.error("Error updating appointment status:", err);
      alert("Error updating appointment status.");
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-success';
      case 'pending':
        return 'bg-warning text-dark';
      case 'cancelled':
        return 'bg-danger';
      case 'completed':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      appointment.patient?.fullName?.toLowerCase().includes(searchLower) ||
      appointment.doctor?.fullName?.toLowerCase().includes(searchLower) ||
      appointment.doctor?.specialty?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusCounts = () => {
    return {
      all: appointments.length,
      pending: appointments.filter(a => a.status === 'pending').length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      completed: appointments.filter(a => a.status === 'completed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <Header user={user} />
      <div className="d-flex">
        <Sidebar userType={user?.userType} />
        <main className="content flex-grow-1 p-5 ps-6">
          <div className="container-fluid mt-4">
            {/* ... (rest of your component code) ... */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="text-primary mb-1">
                  <i className="bi bi-calendar-event me-2"></i>
                  Appointments Management
                </h2>
                <p className="text-muted">Manage all hospital appointments</p>
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => console.log('Navigate to book appointment')}
              >
                <i className="bi bi-plus-circle me-2"></i>
                New Appointment
              </button>
            </div>

            {/* Stats Cards */}
            <div className="row mb-4">
              <div className="col-md-2">
                <div className="card bg-primary text-white">
                  <div className="card-body text-center">
                    <h3>{statusCounts.all}</h3>
                    <small>Total</small>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card bg-warning text-dark">
                  <div className="card-body text-center">
                    <h3>{statusCounts.pending}</h3>
                    <small>Pending</small>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card bg-success text-white">
                  <div className="card-body text-center">
                    <h3>{statusCounts.confirmed}</h3>
                    <small>Confirmed</small>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card bg-info text-white">
                  <div className="card-body text-center">
                    <h3>{statusCounts.completed}</h3>
                    <small>Completed</small>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card bg-danger text-white">
                  <div className="card-body text-center">
                    <h3>{statusCounts.cancelled}</h3>
                    <small>Cancelled</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="card mb-4">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-4">
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search patients, doctors, or specialties..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={filter}
                      onChange={(e) => {
                        setFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="col-md-5 text-end">
                    <button 
                      className="btn btn-outline-primary me-2"
                      onClick={() => fetchData()} // Use fetchData() to refresh
                    >
                      <i className="bi bi-arrow-clockwise me-1"></i>
                      Refresh
                    </button>
                    <button className="btn btn-outline-success">
                      <i className="bi bi-download me-1"></i>
                      Export
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointments Table */}
            <div className="card">
              <div className="card-body p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading appointments...</p>
                  </div>
                ) : filteredAppointments.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Date & Time</th>
                          <th>Patient</th>
                          <th>Doctor</th>
                          <th>Specialty</th>
                          <th>Department</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAppointments.map((appointment) => (
                          <tr key={appointment._id}>
                            <td>
                              <div className="fw-semibold">{formatDate(appointment.date)}</div>
                              <small className="text-muted">{formatTime(appointment.date)}</small>
                            </td>
                            <td>
                              <div className="fw-semibold">{appointment.patient?.fullName || 'N/A'}</div>
                              <small className="text-muted">{appointment.patient?.email || 'N/A'}</small>
                            </td>
                            <td>
                              <div className="fw-semibold">Dr. {appointment.doctor?.fullName || 'N/A'}</div>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark">
                                {appointment.doctor?.specialty || 'General'}
                              </span>
                            </td>
                            <td>
                              {appointment.doctor?.department || 'General'}
                            </td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                                {appointment.status}
                              </span>
                            </td>
                            <td>
                              <small className="text-muted">
                                {formatDate(appointment.createdAt)}
                              </small>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-outline-primary" 
                                  title="View Details"
                                  onClick={() => console.log('View appointment:', appointment._id)}
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-success" 
                                  title="Confirm"
                                  onClick={() => handleUpdateStatus(appointment._id, 'confirmed')}
                                  disabled={appointment.status === 'confirmed' || appointment.status === 'completed' || updating === appointment._id}
                                >
                                  {updating === appointment._id ? (
                                    <div className="spinner-border spinner-border-sm" role="status"></div>
                                  ) : (
                                    <i className="bi bi-check-circle"></i>
                                  )}
                                </button>
                                <button 
                                  className="btn btn-outline-warning" 
                                  title="Complete"
                                  onClick={() => handleUpdateStatus(appointment._id, 'completed')}
                                  disabled={appointment.status === 'completed' || appointment.status === 'cancelled' || updating === appointment._id}
                                >
                                  {updating === appointment._id ? (
                                    <div className="spinner-border spinner-border-sm" role="status"></div>
                                  ) : (
                                    <i className="bi bi-check2-all"></i>
                                  )}
                                </button>
                                <button 
                                  className="btn btn-outline-danger" 
                                  title="Cancel"
                                  onClick={() => handleUpdateStatus(appointment._id, 'cancelled')}
                                  disabled={appointment.status === 'cancelled' || appointment.status === 'completed' || updating === appointment._id}
                                >
                                  {updating === appointment._id ? (
                                    <div className="spinner-border spinner-border-sm" role="status"></div>
                                  ) : (
                                    <i className="bi bi-x-circle"></i>
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-calendar-x fs-1 text-muted"></i>
                    <p className="text-muted mt-2">
                      {searchTerm ? 'No appointments found matching your search' : 'No appointments found'}
                    </p>
                    {searchTerm && (
                      <button 
                        className="btn btn-outline-primary"
                        onClick={() => setSearchTerm('')}
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="card-footer">
                  <nav>
                    <ul className="pagination pagination-sm justify-content-center mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                      </li>
                      
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                          return (
                            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                              <button 
                                className="page-link"
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </button>
                            </li>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <li key={page} className="page-item disabled">
                              <span className="page-link">...</span>
                            </li>
                          );
                        }
                        return null;
                      })}
                      
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default AppointmentsManagement;