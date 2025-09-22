// src/pages/user_view/BookAppointmentPage.jsx

import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Header from "../../components/Header.jsx";
import Sidebar from "../../components/Sidebar.jsx";
import "./BookAppointmentPage.css";

function BookAppointmentPage() {
  const [user, setUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

        const [userResponse, doctorsResponse] = await Promise.all([
          fetch("/api/auth/me", { headers }),
          fetch("/api/appointments/doctors", { headers }),
        ]);

        if (!userResponse.ok || !doctorsResponse.ok) {
          throw new Error("Failed to fetch data.");
        }

        const userData = await userResponse.json();
        const doctorsData = await doctorsResponse.json();

        setUser(userData.user);
        setDoctors(doctorsData);
      } catch (e) {
        console.error("Failed to fetch data:", e);
        setError("Failed to load page data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: selectedDoctor,
          appointmentDate: appointmentDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.msg);
        // Clear the form
        setSelectedDoctor("");
        setAppointmentDate("");
      } else {
        setError(data.msg || "Something went wrong.");
      }
    } catch (e) {
      console.error("Failed to book appointment:", e);
      setError("Failed to book appointment. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Minimum 30 minutes from now
    return now.toISOString().slice(0, 16);
  };

  const getMaxDateTime = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3); // Maximum 3 months from now
    return maxDate.toISOString().slice(0, 16);
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
        <div
          className="spinner-border text-primary mb-3"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <h5 className="text-muted">Loading appointment booking...</h5>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light ">
        <div className="card shadow-lg border-0" style={{ maxWidth: "500px" }}>
          <div className="card-body text-center p-5">
            <i
              className="bi bi-exclamation-triangle text-danger mb-3"
              style={{ fontSize: "3rem" }}
            ></i>
            <h4 className="card-title text-danger mb-3">Access Denied</h4>
            <p className="card-text text-muted mb-4">{error}</p>
            <button
              className="btn btn-primary"
              onClick={() => (window.location.href = "/login")}
            >
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="dashboard-layout bg-light "
      style={{ minHeight: "100vh", width: "100%", maxWidth: "100%" }}
    >
      <Header user={user} />
      <div className="d-flex">
        <Sidebar userType={user?.userType} />
        <main className="content flex-grow-1 p-5">
          <div
            className="container-fluid px-0 ms-5"
            style={{ maxWidth: "100%" }}
          >
            <div className="row justify-content-start mx-0">
              <div className="col-12 col-lg-10 col-xl-11 mt-0">
                {/* Page Header */}
                <div className="d-flex align-items-center mb-2">
                  <div
                    className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: "48px", height: "48px" }}
                  >
                    <i className="bi bi-calendar-plus text-white fs-4"></i>
                  </div>
                  <div>
                    <h2 className="h3 mb-0 text-dark mt-0">
                      Book an Appointment
                    </h2>
                    <p className="text-muted mb-0">
                      Schedule your medical consultation
                    </p>
                  </div>
                </div>

                {/* Alert Messages */}
                {message && (
                  <div
                    className="alert alert-success alert-dismissible fade show"
                    role="alert"
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    <strong>Success!</strong> {message}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setMessage(null)}
                    ></button>
                  </div>
                )}

                {error && (
                  <div
                    className="alert alert-danger alert-dismissible fade show"
                    role="alert"
                  >
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    <strong>Error!</strong> {error}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setError(null)}
                    ></button>
                  </div>
                )}

                {/* Main Form Card */}
                <div className="card shadow-sm border-0">
                  <div className="card-header bg-white border-0 pt-4 px-4">
                    <h6 className="card-title mb-1 d-flex justify-content-center align-items-center">
                      <i className="bi bi-person-check me-2 text-primary "></i>
                      Appointment Details
                    </h6>
                    <p className="d-flex justify-content-center align-items-center text-muted small mb-0">
                      Fill in the information below to book your appointment
                    </p>
                  </div>

                  <div className="card-body p-4">
                    <div className="row">
                      {/* Left Column - Form */}
                      <div className="col-lg-8">
                        <form onSubmit={handleBooking}>
                          {/* Doctor Selection */}
                          <div className="mb-4">
                            <label
                              htmlFor="doctorSelect"
                              className="form-label fw-semibold"
                            >
                              <i className="bi bi-person-badge me-2 text-primary"></i>
                              Select Doctor
                            </label>
                            <select
                              id="doctorSelect"
                              className={`form-select form-select-lg ${
                                selectedDoctor ? "border-success" : ""
                              }`}
                              value={selectedDoctor}
                              onChange={(e) =>
                                setSelectedDoctor(e.target.value)
                              }
                              required
                            >
                              <option value="">
                                <i className="bi bi-chevron-down"></i> Choose a
                                doctor...
                              </option>
                              {doctors.map((doctor) => (
                                <option key={doctor._id} value={doctor._id}>
                                  Dr. {doctor.fullName} - {doctor.email}
                                </option>
                              ))}
                            </select>
                            <div className="form-text">
                              <i className="bi bi-info-circle me-1"></i>
                              Select from our available medical professionals
                            </div>
                          </div>

                          {/* Date & Time Selection */}
                          <div className="mb-4">
                            <label
                              htmlFor="appointmentDate"
                              className="form-label fw-semibold"
                            >
                              <i className="bi bi-calendar-event me-2 text-primary"></i>
                              Appointment Date & Time
                            </label>
                            <input
                              type="datetime-local"
                              id="appointmentDate"
                              className={`form-control form-control-lg ${
                                appointmentDate ? "border-success" : ""
                              }`}
                              value={appointmentDate}
                              onChange={(e) =>
                                setAppointmentDate(e.target.value)
                              }
                              min={getMinDateTime()}
                              max={getMaxDateTime()}
                              required
                            />
                            <div className="form-text">
                              <i className="bi bi-clock me-1"></i>
                              Please select a date and time at least 30 minutes
                              from now
                            </div>
                          </div>

                          {/* Selected Doctor Info */}
                          {selectedDoctor && (
                            <div className="alert alert-info border-0 mb-4">
                              <div className="d-flex align-items-center">
                                <i className="bi bi-info-circle me-3 fs-4"></i>
                                <div>
                                  <h6 className="alert-heading mb-1">
                                    Selected Doctor
                                  </h6>
                                  <p className="mb-0">
                                    <strong>
                                      Dr.{" "}
                                      {
                                        doctors.find(
                                          (d) => d._id === selectedDoctor
                                        )?.fullName
                                      }
                                    </strong>
                                    <br />
                                    <small className="text-muted">
                                      {
                                        doctors.find(
                                          (d) => d._id === selectedDoctor
                                        )?.email
                                      }
                                    </small>
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Submit Button */}
                          <div className="d-grid gap-2">
                            <button
                              type="submit"
                              className="btn btn-primary btn-lg"
                              disabled={
                                isSubmitting ||
                                !selectedDoctor ||
                                !appointmentDate
                              }
                            >
                              {isSubmitting ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                  >
                                    <span className="visually-hidden">
                                      Loading...
                                    </span>
                                  </span>
                                  Booking Appointment...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-calendar-check me-2"></i>
                                  Book Appointment
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Right Column - Guidelines */}
                      <div className="col-lg-4 mt-0">
                        <div className="sticky-top " style={{ top: "2rem" }}>
                          <div className="card bg-light border-0 shadow-sm">
                            <div className="card-body">
                              <h6 className="text-primary mb-3">
                                <i className="bi bi-lightbulb me-2"></i>
                                Booking Guidelines
                              </h6>
                              <ul className="list-unstyled mb-0 small">
                                <li className="mb-2 d-flex align-items-start">
                                  <i className="bi bi-check2 text-success me-2 mt-1 flex-shrink-0"></i>
                                  <span>
                                    Appointments can be booked up to 3 months in
                                    advance
                                  </span>
                                </li>
                                <li className="mb-2 d-flex align-items-start">
                                  <i className="bi bi-check2 text-success me-2 mt-1 flex-shrink-0"></i>
                                  <span>
                                    Please arrive 15 minutes before your
                                    scheduled time
                                  </span>
                                </li>
                                <li className="mb-2 d-flex align-items-start">
                                  <i className="bi bi-check2 text-success me-2 mt-1 flex-shrink-0"></i>
                                  <span>
                                    You will receive a confirmation via email
                                  </span>
                                </li>
                                <li className="mb-3 d-flex align-items-start">
                                  <i className="bi bi-check2 text-success me-2 mt-1 flex-shrink-0"></i>
                                  <span>
                                    Cancellations must be made at least 24 hours
                                    in advance
                                  </span>
                                </li>
                              </ul>

                              {/* Additional Tips */}
                              <hr className="my-3" />
                              <h6 className="text-primary mb-3">
                                <i className="bi bi-info-circle me-2"></i>
                                Preparation Tips
                              </h6>
                              <ul className="list-unstyled mb-0 small">
                                <li className="mb-2 d-flex align-items-start">
                                  <i className="bi bi-clipboard me-2 mt-1 text-info flex-shrink-0"></i>
                                  <span>
                                    Bring your medical history and current
                                    medications
                                  </span>
                                </li>
                                <li className="mb-2 d-flex align-items-start">
                                  <i className="bi bi-card-checklist me-2 mt-1 text-info flex-shrink-0"></i>
                                  <span>
                                    Prepare a list of symptoms or concerns
                                  </span>
                                </li>
                                <li className="d-flex align-items-start">
                                  <i className="bi bi-credit-card me-2 mt-1 text-info flex-shrink-0"></i>
                                  <span>
                                    Have your insurance card and ID ready
                                  </span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact Card */}
                <div className="card border-0 bg-danger text-white mt-4">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-telephone-fill me-3 fs-4"></i>
                      <div>
                        <h6 className="card-title mb-1">Emergency Contact</h6>
                        <p className="card-text mb-0">
                          For urgent medical needs, call:{" "}
                          <strong>+94 11 123 4567</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default BookAppointmentPage;
