import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Header from "../../components/Header.jsx";
import Sidebar from "../../components/Sidebar.jsx";
import './DoctorManagement.css';

function DoctorManagement() {
    const [doctors, setDoctors] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentDoctor, setCurrentDoctor] = useState({ 
        fullName: "", 
        email: "", 
        phoneNumber: "", 
        username: "", 
        password: "", 
        specialty: "",
        userType: "doctor" 
    });

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
                headers: { Authorization: `Bearer ${token}` },
            });
            const userData = await userResponse.json();
            setUser(userData.user);

            const doctorsResponse = await fetch("/api/doctors", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!doctorsResponse.ok) {
                throw new Error(`HTTP error! status: ${doctorsResponse.status}`);
            }

            const doctorData = await doctorsResponse.json();
            setDoctors(doctorData);
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
        setCurrentDoctor({ 
            fullName: "", 
            email: "", 
            phoneNumber: "", 
            username: "", 
            password: "", 
            specialty: "",
            userType: "doctor" 
        });
        setShowModal(true);
    };

    const handleShowEditModal = (doctor) => {
        setIsEditing(true);
        setCurrentDoctor({ ...doctor, password: "" }); // Never show the password in the edit form
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentDoctor({ ...currentDoctor, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const method = isEditing ? "PUT" : "POST";
        const url = isEditing ? `/api/doctors/${currentDoctor._id}` : "/api/doctors";
        
        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(currentDoctor),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || `Failed to ${isEditing ? "update" : "add"} doctor.`);
            }

            await fetchData(); // Re-fetch all doctors to update the list
            handleCloseModal();
            alert(`Doctor ${isEditing ? "updated" : "added"} successfully!`);
        } catch (err) {
            console.error("Submission failed:", err);
            alert(err.message);
        }
    };

    const handleDeleteDoctor = async (id) => {
        if (window.confirm("Are you sure you want to delete this doctor?")) {
            const token = localStorage.getItem("token");
            try {
                const response = await fetch(`/api/doctors/${id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.msg || "Failed to delete doctor.");
                }

                setDoctors(prevDoctors => prevDoctors.filter(doctor => doctor._id !== id));
                alert("Doctor deleted successfully!");
            } catch (err) {
                console.error("Deletion failed:", err);
                alert(err.message);
            }
        }
    };

    const filteredDoctors = doctors.filter(
        (doctor) =>
            doctor.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <div className="container-fluid">
                        <div className="doctor-management-card card shadow-sm p-5 border-0">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h2 className="m-0 text-primary">Doctor Management</h2>
                                <button className="btn btn-primary d-flex align-items-center" onClick={handleShowAddModal}>
                                    <i className="bi bi-person-plus-fill me-2"></i>
                                    Add New Doctor
                                </button>
                            </div>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search doctors..."
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
                                            <th scope="col">Specialty</th>
                                            <th scope="col">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDoctors.length > 0 ? (
                                            filteredDoctors.map((doctor) => (
                                                <tr key={doctor._id}>
                                                    <th scope="row">{doctor._id}</th>
                                                    <td>{doctor.fullName}</td>
                                                    <td>{doctor.email}</td>
                                                    <td>{doctor.phoneNumber}</td>
                                                    <td>{doctor.specialty || 'N/A'}</td>
                                                    <td>
                                                        <button className="btn btn-info btn-sm me-2 text-white" onClick={() => handleShowEditModal(doctor)}>
                                                            <i className="bi bi-pencil-fill"></i>
                                                        </button>
                                                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteDoctor(doctor._id)}>
                                                            <i className="bi bi-trash-fill"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center text-muted">
                                                    No doctors found.
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

            {/* Doctor Add/Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? "Edit Doctor" : "Add New Doctor"}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="fullName"
                                value={currentDoctor.fullName}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={currentDoctor.email}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                                type="tel"
                                name="phoneNumber"
                                value={currentDoctor.phoneNumber}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                name="username"
                                value={currentDoctor.username}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Specialty</Form.Label>
                            <Form.Control
                                type="text"
                                name="specialty"
                                value={currentDoctor.specialty}
                                onChange={handleChange}
                                // The 'required' attribute has been removed.
                            />
                        </Form.Group>
                        {!isEditing && (
                            <Form.Group className="mb-3">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="password"
                                    value={currentDoctor.password}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Close
                        </Button>
                        <Button variant="primary" type="submit">
                            {isEditing ? "Update Doctor" : "Add Doctor"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}

export default DoctorManagement;