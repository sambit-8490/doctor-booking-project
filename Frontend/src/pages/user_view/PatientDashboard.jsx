// src/pages/user_view/PatientDashboard.jsx

import React, { useState, useEffect } from "react";
import { NavLink } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './PatientDashboard.css';

function PatientDashboard() {
  const [user, setUser] = useState(null);
  const [allAppointments, setAllAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You are not authorized. Please log in.");
          setLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch user and all appointments in parallel
        const [userResponse, appointmentsResponse] = await Promise.all([
          fetch("/api/auth/me", { headers }),
          fetch("/api/appointments/my-appointments-all", { headers }),
        ]);

        if (!userResponse.ok || !appointmentsResponse.ok) {
          throw new Error("Failed to fetch data.");
        }

        const userData = await userResponse.json();
        const appointmentsData = await appointmentsResponse.json();

        setUser(userData.user);
        setAllAppointments(appointmentsData);

        const now = new Date();
        const upcoming = appointmentsData.filter(app => new Date(app.date) >= now);
        setUpcomingAppointments(upcoming);
        
      } catch (e) {
        console.error("Failed to fetch data:", e);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
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
    <div className="patient-dashboard-content patient-dashboard-centered">
      <div className="container-fluid patient-dashboard-main-content">
        <h2 className="patient-dashboard-title mb-4">
          Patient Dashboard Overview <i className="bi bi-graph-up-arrow"></i>
        </h2>
        <p className="lead mb-5">
          Welcome, {user?.fullName}. Here is a quick summary of your key information.
        </p>

        <div className="row g-4 mb-5">
          {/* Card 1: Total Appointments */}
          <div className="col-md-6 col-lg-3">
            <div className="patient-dashboard-card patient-dashboard-card-blue shadow-sm">
              <h4 className="card-title">Total Appointments</h4>
              <p className="patient-dashboard-card-value">{allAppointments.length}</p>
              <NavLink to="/my-records" className="patient-dashboard-card-link">
                View Details <i className="bi bi-arrow-right-circle-fill"></i>
              </NavLink>
            </div>
          </div>

          {/* Card 2: Upcoming Appointments */}
          <div className="col-md-6 col-lg-3">
            <div className="patient-dashboard-card patient-dashboard-card-green shadow-sm">
              <h4 className="card-title">Upcoming Appointments</h4>
              <p className="patient-dashboard-card-value">{upcomingAppointments.length}</p>
              <NavLink to="/my-records" className="patient-dashboard-card-link">
                View Details <i className="bi bi-arrow-right-circle-fill"></i>
              </NavLink>
            </div>
          </div>

          {/* Card 3: Book Appointment */}
          <div className="col-md-6 col-lg-3">
            <div className="patient-dashboard-card patient-dashboard-card-yellow shadow-sm">
              <h4 className="card-title">Book Appointment</h4>
              <p className="patient-dashboard-card-value"><i className="bi bi-calendar-plus-fill"></i></p>
              <NavLink to="/book-appointment" className="patient-dashboard-card-link">
                New Booking <i className="bi bi-arrow-right-circle-fill"></i>
              </NavLink>
            </div>
          </div>

          {/* Card 4: View Records */}
          <div className="col-md-6 col-lg-3">
            <div className="patient-dashboard-card patient-dashboard-card-red shadow-sm">
              <h4 className="card-title">My Medical Records</h4>
              <p className="patient-dashboard-card-value"><i className="bi bi-file-earmark-medical-fill"></i></p>
              <NavLink to="/my-records" className="patient-dashboard-card-link">
                View Records <i className="bi bi-arrow-right-circle-fill"></i>
              </NavLink>
            </div>
          </div>
        </div>

        {/* New: Upcoming Appointments Section with List */}
        <div className="upcoming-appointments-section">
          <h3 className="section-title mb-4">Upcoming Appointments</h3>
          {upcomingAppointments.length > 0 ? (
            <div className="list-group">
              {upcomingAppointments.map((app) => (
                <div key={app._id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center mb-2 rounded shadow-sm">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-calendar-check-fill text-primary me-3 fs-4"></i>
                    <div>
                      <h5 className="mb-1">{new Date(app.date).toLocaleDateString()}</h5>
                      <p className="mb-0 text-muted">{new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} with Dr. {app.doctor.fullName}</p>
                    </div>
                  </div>
                  <i className="bi bi-chevron-right text-muted"></i>
                </div>
              ))}
            </div>
          ) : (
            <div className="alert alert-secondary text-center" role="alert">
              You have no upcoming appointments.
            </div>
          )}
        </div>

        {/* Quick Links Card */}
        <div className="dashboard-card card p-4 shadow-sm quick-links-card mt-5">
            <h3 className="card-title text-info">Quick Links</h3>
            <div className="d-flex flex-wrap gap-2">
              <NavLink to="/my-records" className="btn btn-secondary">
                <i className="bi bi-file-earmark-text me-2"></i>
                View My Medical Records
              </NavLink>
              <NavLink to="/book-appointment" className="btn btn-success">
                <i className="bi bi-calendar-plus me-2"></i>
                Book a New Appointment
              </NavLink>
            </div>
          </div>
      </div>
    </div>
  );
}

export default PatientDashboard;