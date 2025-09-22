import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Header from "../../components/Header.jsx";
import Sidebar from "../../components/Sidebar.jsx";
import './PatientManagement.css';

function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  // UPDATED: Initialize currentPatient with a username field
  const [currentPatient, setCurrentPatient] = useState({ fullName: "", email: "", username: "", password: "", userType: "patient" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authorized. Please log in.");
        setLoading(false);
        return;
      }

      const userResponse = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const userData = await userResponse.json();
      setUser(userData.user);

      const patientsResponse = await fetch("/api/patients", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!patientsResponse.ok) {
        throw new Error(`HTTP error! status: ${patientsResponse.status}`);
      }

      const patientData = await patientsResponse.json();
      setPatients(patientData);
      setError(null);
    } catch (e) {
      console.error("Failed to fetch data:", e);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleShowAddModal = () => {
    setIsEditing(false);
    // UPDATED: Reset currentPatient to include an empty username field
    setCurrentPatient({ fullName: "", email: "", phoneNumber: "", username: "", password: "", userType: "patient" });
    setShowModal(true);
  };

  const handleShowEditModal = (patient) => {
    setIsEditing(true);
    // Ensure username is included when editing
    setCurrentPatient({ ...patient, password: "" });
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentPatient({ ...currentPatient, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `/api/patients/${currentPatient._id}` : "/api/patients";
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(currentPatient),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditing ? "update" : "add"} patient.`);
      }

      await fetchData();
      handleCloseModal();
      alert(`Patient ${isEditing ? "updated" : "added"} successfully!`);
    } catch (err) {
      console.error("Submission failed:", err);
      alert(err.message);
    }
  };

  const handleDeletePatient = async (id) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`/api/patients/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete patient.");
        }

        await fetchData();
        alert("Patient deleted successfully!");
      } catch (err) {
        console.error("Deletion failed:", err);
        alert(err.message);
      }
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <>
      <Header user={user} />
      <div className="d-flex">
        <Sidebar userType={user?.userType} />
        <main className="content flex-grow-1 p-5 ps-6">
          <div className="container-fluid">
            <div className="patient-management-card shadow-sm p-5 border-0">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="m-0 text-primary">Patient Management</h2>
                <button className="btn btn-primary d-flex align-items-center" onClick={handleShowAddModal}>
                  <i className="bi bi-person-plus-fill me-2"></i>
                  Add New Patient
                </button>
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="table-responsive">
                <table className="table table-hover table-striped">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Name</th>
                      <th scope="col">Email</th>
                      <th scope="col">Phone</th>
                      <th scope="col">Status</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => (
                        <tr key={patient._id}>
                          <th scope="row">{patient._id}</th>
                          <td>{patient.fullName}</td>
                          <td>{patient.email}</td>
                          <td>{patient.phoneNumber}</td>
                          <td>
                            <span
                              className={`badge bg-${
                                patient.userType === "patient" ? "success" : "danger"
                              }`}
                            >
                              {patient.userType}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-info btn-sm me-2 text-white" onClick={() => handleShowEditModal(patient)}>
                              <i className="bi bi-pencil-fill"></i>
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeletePatient(patient._id)}>
                              <i className="bi bi-trash-fill"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">
                          No patients found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Patient Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? "Edit Patient" : "Add New Patient"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                value={currentPatient.fullName}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={currentPatient.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                name="phoneNumber"
                value={currentPatient.phoneNumber}
                onChange={handleChange}
                required
              />
            </Form.Group>
            {/* ADDED: Username field */}
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={currentPatient.username}
                onChange={handleChange}
                required
              />
            </Form.Group>
            {!isEditing && (
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={currentPatient.password}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label>User Type</Form.Label>
              <Form.Control
                as="select"
                name="userType"
                value={currentPatient.userType}
                onChange={handleChange}
                required
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </Form.Control>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              {isEditing ? "Update Patient" : "Add Patient"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default PatientManagement;