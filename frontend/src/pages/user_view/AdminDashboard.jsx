import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Dashboard.css";
import "./PatientDashboard.css";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    upcomingAppointments: 0,
    newRegistrations: 0,
  });

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No authentication token found. Please log in.");
          return;
        }

        // Fetch stats
        const statsResponse = await fetch("/api/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const statsData = await statsResponse.json();
        if (statsResponse.ok && statsData.success) {
          setStats(statsData.stats);
        }

        // Fetch recent appointments
        const appointmentsResponse = await fetch("/api/appointments/recent", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const appointmentsData = await appointmentsResponse.json();
        if (appointmentsResponse.ok && appointmentsData.success) {
          setAppointments(appointmentsData.appointments || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-success";
      case "pending":
        return "bg-warning text-dark";
      case "cancelled":
        return "bg-danger";
      case "completed":
        return "bg-info";
      default:
        return "bg-secondary";
    }
  };

  const handleViewAppointment = (appointmentId) => {
    console.log("View appointment:", appointmentId);
    // navigate(`/appointments/${appointmentId}`) if you build details page later
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      setUpdating(appointmentId);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `/api/appointments/${appointmentId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        setAppointments(
          appointments.map((appt) =>
            appt.id === appointmentId ? { ...appt, status: newStatus } : appt
          )
        );
      } else {
        console.error("Failed to update status:", data.msg);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="container-fluid dashboard-content mt-4">
      <h2 className="mb-2 text-primary">Admin Dashboard Overview 📊</h2>
      <p className="lead">
        Welcome, Admin. Here is a quick summary of the hospital's key metrics.
      </p>

      <div className="row g-4">
        {/* Total Patients */}
        <div className="col-12 col-sm-6 col-lg-3">
          <NavLink to="/patients" className="text-decoration-none">
            <div
              className="card shadow-sm border-0 rounded-4 h-100 text-white"
              style={{
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              }}
            >
              <div className="card-body d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="mb-0 text-white-50">Total Patients</h6>
                    <i className="bi bi-people-fill fs-4"></i>
                  </div>
                  <h3 className="fw-bold">{stats.totalPatients}</h3>
                </div>
                <span className="fw-semibold mt-2 d-flex align-items-center">
                  View Details <i className="bi bi-arrow-right ms-1"></i>
                </span>
              </div>
            </div>
          </NavLink>
        </div>

        {/* Total Doctors */}
        <div className="col-12 col-sm-6 col-lg-3">
          <NavLink to="/doctors" className="text-decoration-none">
            <div
              className="card shadow-sm border-0 rounded-4 h-100 text-white"
              style={{
                background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              }}
            >
              <div className="card-body d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="mb-0 text-white-50">Total Doctors</h6>
                    <i className="bi bi-person-badge-fill fs-4"></i>
                  </div>
                  <h3 className="fw-bold">{stats.totalDoctors}</h3>
                </div>
                <span className="fw-semibold mt-2 d-flex align-items-center">
                  View Details <i className="bi bi-arrow-right ms-1"></i>
                </span>
              </div>
            </div>
          </NavLink>
        </div>

        {/* Upcoming Appointments */}
        <div className="col-12 col-sm-6 col-lg-3">
          <NavLink to="/calendar" className="text-decoration-none">
            <div
              className="card shadow-sm border-0 rounded-4 h-100 text-white"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              <div className="card-body d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="mb-0 text-white-50">
                      Upcoming Appointments
                    </h6>
                    <i className="bi bi-calendar-event-fill fs-4"></i>
                  </div>
                  <h3 className="fw-bold">{stats.upcomingAppointments}</h3>
                </div>
                <span className="fw-semibold mt-2 d-flex align-items-center">
                  View Calendar <i className="bi bi-arrow-right ms-1"></i>
                </span>
              </div>
            </div>
          </NavLink>
        </div>

        {/* New Registrations */}
        <div className="col-12 col-sm-6 col-lg-3">
          <NavLink to="/users" className="text-decoration-none">
            <div
              className="card shadow-sm border-0 rounded-4 h-100 text-white"
              style={{
                background: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
              }}
            >
              <div className="card-body d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="mb-0 text-white-50">
                      New Registrations Today
                    </h6>
                    <i className="bi bi-person-plus-fill fs-4"></i>
                  </div>
                  <h3 className="fw-bold">{stats.newRegistrations}</h3>
                </div>
                <span className="fw-semibold mt-2 d-flex align-items-center">
                  Manage Users <i className="bi bi-arrow-right ms-1"></i>
                </span>
              </div>
            </div>
          </NavLink>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0">
                  <i className="bi bi-calendar-event me-2"></i>
                  Recent Appointments
                </h3>
                {/* ✅ Fixed: Goes to /appointments now */}
                <NavLink
                  to="/appointments"
                  className="btn btn-primary btn-sm fw-semibold d-flex align-items-center"
                  style={{ borderRadius: "0.75rem" }}
                >
                  View All <i className="bi bi-arrow-right ms-1"></i>
                </NavLink>
              </div>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : appointments.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date & Time</th>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appointment, index) => (
                        <tr key={appointment.id || index}>
                          <td>
                            <div className="fw-semibold">
                              {formatDate(appointment.date)}
                            </div>
                            <small className="text-muted">
                              {formatTime(appointment.time)}
                            </small>
                          </td>
                          <td>
                            <div className="fw-semibold">
                              {appointment.patientName}
                            </div>
                            <small className="text-muted">
                              ID: {appointment.patientId}
                            </small>
                          </td>
                          <td>
                            <div className="fw-semibold">
                              Dr. {appointment.doctorName}
                            </div>
                            <small className="text-muted">
                              {appointment.doctorSpecialty}
                            </small>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark">
                              {appointment.department}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge ${getStatusBadgeClass(
                                appointment.status
                              )}`}
                            >
                              {appointment.status}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-primary"
                                title="View Details"
                                onClick={() =>
                                  handleViewAppointment(appointment.id)
                                }
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              <button
                                className="btn btn-success"
                                title="Confirm"
                                onClick={() =>
                                  handleUpdateStatus(
                                    appointment.id,
                                    "confirmed"
                                  )
                                }
                                disabled={
                                  appointment.status === "confirmed" ||
                                  appointment.status === "completed" ||
                                  updating === appointment.id
                                }
                              >
                                {updating === appointment.id ? (
                                  <div
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                  ></div>
                                ) : (
                                  <i className="bi bi-check-circle"></i>
                                )}
                              </button>
                              <button
                                className="btn btn-danger"
                                title="Cancel"
                                onClick={() =>
                                  handleUpdateStatus(
                                    appointment.id,
                                    "cancelled"
                                  )
                                }
                                disabled={
                                  appointment.status === "cancelled" ||
                                  appointment.status === "completed" ||
                                  updating === appointment.id
                                }
                              >
                                {updating === appointment.id ? (
                                  <div
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                  ></div>
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
                <div className="text-center py-4">
                  <i className="bi bi-calendar-x fs-1 text-muted"></i>
                  <p className="text-muted mt-2">
                    No recent appointments found
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
