import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './AppointmentsCalendar.css';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

function CalendarPage() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState('month'); // month, week, day
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error("No authentication token found");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch user data
        const userResponse = await fetch('/api/auth/me', { headers });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.user);
        }

        // Fetch appointments for calendar
        const appointmentsResponse = await fetch('/api/appointments/all', { headers });
        if (appointmentsResponse.ok) {
          const appointmentsData = await appointmentsResponse.json();
          setAppointments(appointmentsData.appointments || []);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getAppointmentsForDate = (date) => {
    const dateStr = formatDate(date);
    return appointments.filter(apt => apt.date === dateStr);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return '#28a745';
      case 'pending': return '#ffc107';
      case 'cancelled': return '#dc3545';
      case 'completed': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  const formatTime = (timeString) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="calendar-day empty"></div>
      );
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayAppointments = getAppointmentsForDate(date);
      const isToday = formatDate(date) === formatDate(new Date());
      const isSelected = selectedDate && formatDate(date) === formatDate(selectedDate);

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${dayAppointments.length > 0 ? 'has-appointments' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          <div className="day-number">{day}</div>
          {dayAppointments.length > 0 && (
            <div className="appointments-indicator">
              <span className="appointment-count">{dayAppointments.length}</span>
              <div className="appointment-dots">
                {dayAppointments.slice(0, 3).map((apt, index) => (
                  <div
                    key={index}
                    className="appointment-dot"
                    style={{ backgroundColor: getStatusColor(apt.status) }}
                    title={`${apt.patientName} - ${formatTime(apt.time)}`}
                  ></div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="appointment-dot more">+{dayAppointments.length - 3}</div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const renderSelectedDateAppointments = () => {
    if (!selectedDate) return null;

    const dayAppointments = getAppointmentsForDate(selectedDate);
    
    return (
      <div className="selected-date-appointments">
        <h5 className="mb-3">
          <i className="bi bi-calendar-event me-2"></i>
          Appointments for {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </h5>

        {dayAppointments.length > 0 ? (
          <div className="appointments-list">
            {dayAppointments.map((appointment, index) => (
              <div
                key={index}
                className="appointment-card"
                onClick={() => setSelectedAppointment(appointment)}
              >
                <div className="appointment-time">
                  <i className="bi bi-clock me-1"></i>
                  {formatTime(appointment.time)}
                </div>
                <div className="appointment-details">
                  <div className="patient-name">
                    <i className="bi bi-person me-1"></i>
                    {appointment.patientName}
                  </div>
                  <div className="doctor-name">
                    <i className="bi bi-person-badge me-1"></i>
                    Dr. {appointment.doctorName}
                  </div>
                  <div className="department">
                    <i className="bi bi-building me-1"></i>
                    {appointment.department}
                  </div>
                </div>
                <div className="appointment-status">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(appointment.status) }}
                  >
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-appointments">
            <i className="bi bi-calendar-x fs-1 text-muted"></i>
            <p className="text-muted mt-2">No appointments scheduled for this date</p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading calendar...</p>
      </div>
    );
  }

  return (
    <>
      <Header user={user} />
      <div className="d-flex">
        <Sidebar userType={user?.userType} user={user} />
        <main className="content flex-grow-1 p-4">
          <div className="container-fluid">
            <div className="calendar-container">
              {/* Calendar Header */}
              <div className="calendar-header">
                <div className="calendar-nav">
                  <h2 className="calendar-title">
                    <i className="bi bi-calendar3 me-2"></i>
                    Appointment Calendar
                  </h2>
                  <div className="calendar-controls">
                    <button
                      className="btn btn-outline-primary btn-sm me-2"
                      onClick={goToToday}
                    >
                      <i className="bi bi-calendar-day me-1"></i>
                      Today
                    </button>
                    <div className="btn-group btn-group-sm me-3">
                      <button
                        className={`btn ${view === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setView('month')}
                      >
                        Month
                      </button>
                      <button
                        className={`btn ${view === 'week' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setView('week')}
                      >
                        Week
                      </button>
                    </div>
                  </div>
                </div>

                <div className="month-navigation">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={goToPreviousMonth}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  <h3 className="month-year">
                    {currentDate.toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </h3>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={goToNextMonth}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="calendar-content">
                <div className="calendar-grid">
                  <div className="calendar-weekdays">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="weekday">{day}</div>
                    ))}
                  </div>
                  <div className="calendar-days">
                    {renderCalendarDays()}
                  </div>
                </div>

                {/* Appointments Sidebar */}
                <div className="appointments-sidebar">
                  <div className="appointments-summary">
                    <h4 className="mb-3">
                      <i className="bi bi-list-task me-2"></i>
                      Summary
                    </h4>
                    <div className="summary-stats">
                      <div className="stat-item">
                        <span className="stat-number">{appointments.length}</span>
                        <span className="stat-label">Total Appointments</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">
                          {appointments.filter(apt => apt.status === 'pending').length}
                        </span>
                        <span className="stat-label">Pending</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">
                          {appointments.filter(apt => apt.status === 'confirmed').length}
                        </span>
                        <span className="stat-label">Confirmed</span>
                      </div>
                    </div>
                  </div>

                  {renderSelectedDateAppointments()}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-calendar-event me-2"></i>
                  Appointment Details
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedAppointment(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6><i className="bi bi-person me-2"></i>Patient Information</h6>
                    <p><strong>Name:</strong> {selectedAppointment.patientName}</p>
                    <p><strong>ID:</strong> {selectedAppointment.patientId}</p>
                  </div>
                  <div className="col-md-6">
                    <h6><i className="bi bi-person-badge me-2"></i>Doctor Information</h6>
                    <p><strong>Name:</strong> Dr. {selectedAppointment.doctorName}</p>
                    <p><strong>Specialty:</strong> {selectedAppointment.doctorSpecialty}</p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <h6><i className="bi bi-calendar me-2"></i>Schedule</h6>
                    <p><strong>Date:</strong> {new Date(selectedAppointment.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {formatTime(selectedAppointment.time)}</p>
                  </div>
                  <div className="col-md-6">
                    <h6><i className="bi bi-building me-2"></i>Department & Status</h6>
                    <p><strong>Department:</strong> {selectedAppointment.department}</p>
                    <p>
                      <strong>Status:</strong>
                      <span
                        className="badge ms-2"
                        style={{ backgroundColor: getStatusColor(selectedAppointment.status) }}
                      >
                        {selectedAppointment.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedAppointment(null)}
                >
                  Close
                </button>
                <button type="button" className="btn btn-primary">
                  <i className="bi bi-pencil me-1"></i>
                  Edit Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CalendarPage;