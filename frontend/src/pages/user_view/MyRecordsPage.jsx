// src/pages/user_view/MyRecordsPage.jsx
import React, { useState, useEffect } from "react";
import Header from "../../components/Header.jsx";
import Sidebar from "../../components/Sidebar.jsx";
import axios from "axios";
import "./MyRecordsPage.css";

function MyRecordsPage() {
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]); // patient records
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) throw new Error("Not authorized");

        // Fetch logged-in user info
        const userRes = await axios.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data.user);

        
        // Fetch patient records
        const recordsRes = await axios.get("/api/patients/my-record", {
          headers: { authorization: `Bearer ${token}` },
        });
        setRecords(recordsRes.data.patients);
      } catch (err) {
        console.error(err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Function to download PDF
  const downloadPDF = async (patientId, filename) => {
    try {
      const res = await axios.get(
        `/api/patients/download-condition/${patientId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob", // Important for binary data
        }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename || "condition.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Failed to download PDF.");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3" role="alert">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Header user={user} />
      <div className="main-content-wrapper d-flex">
        <Sidebar userType={user?.userType} />
        <main className="main-content-area flex-grow-1 p-4">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="h3 mb-0 text-primary">
                    <i className="fas fa-file-medical me-2"></i>
                    My Medical Records
                  </h2>
                </div>

                {records.length > 0 ? (
                  <div className="card shadow-sm">
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover table-striped mb-0">
                          <thead className="table-dark">
                            <tr>
                              <th scope="col">
                                <i className="fas fa-user me-2"></i>
                                Full Name
                              </th>
                              <th scope="col">
                                <i className="fas fa-envelope me-2"></i>
                                Email
                              </th>
                              <th scope="col">
                                <i className="fas fa-phone me-2"></i>
                                Phone
                              </th>
                              <th scope="col">
                                <i className="fas fa-user-md me-2"></i>
                                Doctor Name
                              </th>
                              <th scope="col" className="text-center">
                                <i className="fas fa-file-pdf me-2"></i>
                                Medical Report
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {records.map((record) => (
                              <tr key={record._id}>
                                <td className="fw-semibold">
                                  {record.patient?.fullName || record.fullName}
                                </td>
                                <td>
                                  <a
                                    href={`mailto:${
                                      record.patient?.email || record.email
                                    }`}
                                    className="text-decoration-none"
                                  >
                                    {record.patient?.email || record.email}
                                  </a>
                                </td>
                                <td>
                                  <span className="badge bg-secondary">
                                    {record.patient?.phoneNumber ||
                                      record.phoneNumber}
                                  </span>
                                </td>
                                <td>
                                  <span className="text-success fw-semibold">
                                    {record.doctor?.fullName || "Not Assigned"}
                                  </span>
                                </td>
                                <td className="text-center">
                                  {record.patient?.conditionPDF ||
                                  record.conditionPDF ? (
                                    <button
                                      onClick={() =>
                                        downloadPDF(
                                          record.patient?._id || record._id,
                                          record.patient?.conditionPDF ||
                                            record.conditionPDF
                                        )
                                      }
                                      className="btn btn-primary btn-sm d-inline-flex align-items-center"
                                      title="Download Medical Report"
                                    >
                                      <i className="fas fa-download me-1"></i>
                                      Download PDF
                                    </button>
                                  ) : (
                                    <span className="badge bg-warning text-dark">
                                      <i className="fas fa-exclamation-triangle me-1"></i>
                                      No PDF uploaded
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="alert alert-info d-flex align-items-center"
                    role="alert"
                  >
                    <i className="fas fa-info-circle me-3 fs-4"></i>
                    <div>
                      <h5 className="alert-heading mb-1">No Records Found</h5>
                      <p className="mb-0">
                        You don't have any medical records yet. Records will
                        appear here once they are added by your healthcare
                        provider.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default MyRecordsPage;
