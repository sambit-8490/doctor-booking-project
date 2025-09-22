// src/pages/user_view/ReportsPage.jsx

import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { QRCodeSVG } from "qrcode.react";
// Remove the static import of jsQR
// import jsQR from "jsqr";

import "./ReportsPage.css";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

function ReportsPage() {
  const [user, setUser] = useState(null);
  const [reportsData, setReportsData] = useState({
    userSummary: null,
    allUsers: [],
    demographics: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("userSummary");
  const [scannedPatient, setScannedPatient] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You are not authorized. Please log in.");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const [
          userResponse,
          userSummaryResponse,
          allUsersResponse,
          demographicsResponse,
        ] = await Promise.all([
          fetch("/api/auth/me", { headers }),
          fetch("/api/reports/user-summary", { headers }),
          fetch("/api/reports/all-users", { headers }),
          fetch("/api/reports/demographics", { headers }),
        ]);

        if (
          !userResponse.ok ||
          !userSummaryResponse.ok ||
          !allUsersResponse.ok ||
          !demographicsResponse.ok
        ) {
          throw new Error("Failed to fetch all data.");
        }

        const userData = await userResponse.json();
        const userSummaryData = await userSummaryResponse.json();
        const allUsersData = await allUsersResponse.json();
        const demographicsData = await demographicsResponse.json();

        setUser(userData.user);
        setReportsData({
          userSummary: userSummaryData,
          allUsers: allUsersData,
          demographics: demographicsData,
        });
        setError(null);
      } catch (e) {
        console.error("Failed to fetch data:", e);
        setError("Failed to load reports. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Download QR code as PNG
  const handleDownloadQrCode = (id, fullName) => {
    const svgElement = document.getElementById(`qrcode-${id}`);
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const size = 200;
    canvas.width = size;
    canvas.height = size;
    img.width = size;
    img.height = size;

    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${fullName}-QR-Code.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  // Handle QR image upload with dynamic import of jsQR
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Dynamically import jsQR
      const jsQR = (await import('jsqr')).default;

      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);

          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const qrCode = jsQR(imageData.data, img.width, img.height);

          if (qrCode) {
            fetchPatientDetails(qrCode.data);
          } else {
            alert("No QR code found in this image.");
          }
        };
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Failed to load jsQR:", error);
      alert("Failed to load QR code scanner. Please try again.");
    }
  };

  const fetchPatientDetails = async (id) => {
    setScannedPatient(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/reports/all-users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Patient not found.");
      const data = await response.json();
      setScannedPatient(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch patient details.");
    }
  };

  const renderReportContent = () => {
    if (activeTab === "userSummary" && reportsData.userSummary) {
      const { totalUsers, patients, doctors, admins } = reportsData.userSummary;
      return (
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-3">
            <div className="p-3 bg-light rounded text-center">
              <h5>Total Users</h5>
              <p className="fs-3 fw-bold">{totalUsers}</p>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="p-3 bg-success text-white rounded text-center">
              <h5>Patients</h5>
              <p className="fs-3 fw-bold">{patients}</p>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="p-3 bg-info text-white rounded text-center">
              <h5>Doctors</h5>
              <p className="fs-3 fw-bold">{doctors}</p>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="p-3 bg-secondary text-white rounded text-center">
              <h5>Admins</h5>
              <p className="fs-3 fw-bold">{admins}</p>
            </div>
          </div>
        </div>
      );
    } else if (activeTab === "allUsers" && reportsData.allUsers) {
      return (
        <div className="table-responsive">
          <table className="table table-hover table-striped">
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>User Type</th>
                <th>QR Code</th>
              </tr>
            </thead>
            <tbody>
              {reportsData.allUsers.map((report) => (
                <tr key={report._id}>
                  <td>{report.fullName}</td>
                  <td>{report.email}</td>
                  <td>{report.userType}</td>
                  <td>
                    {report.userType === "patient" && (
                      <div className="d-flex align-items-center">
                        <QRCodeSVG
                          value={report._id}
                          size={50}
                          id={`qrcode-${report._id}`}
                        />
                        <button
                          className="btn btn-sm btn-primary ms-3"
                          onClick={() =>
                            handleDownloadQrCode(report._id, report.fullName)
                          }
                        >
                          <i className="bi bi-download"></i>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (activeTab === "demographics" && reportsData.demographics) {
      return (
        <div className="table-responsive">
          <h4 className="mb-3">Patient Demographics by Gender</h4>
          <table className="table table-hover table-striped">
            <thead className="table-dark">
              <tr>
                <th>Gender</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {reportsData.demographics.map((demo, index) => (
                <tr key={index}>
                  <td>{demo._id || "Not Specified"}</td>
                  <td>{demo.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (activeTab === "qrScan") {
      return (
        <div>
          <h5>Upload a QR Code Image</h5>
          <input
            type="file"
            accept="image/*"
            className="form-control mb-3"
            onChange={handleFileUpload}
          />
          {scannedPatient && (
            <div className="mt-4 p-4 border rounded shadow-sm bg-light">
              <h4>Patient Details</h4>
              <p>
                <strong>Name:</strong> {scannedPatient.fullName}
              </p>
              <p>
                <strong>Email:</strong> {scannedPatient.email}
              </p>
              <p>
                <strong>User Type:</strong> {scannedPatient.userType}
              </p>
            </div>
          )}
        </div>
      );
    }

    return <p>Select a report to view.</p>;
  };

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
            <div className="reports-card card shadow-sm p-5 border-0">
              <h2 className="m-0 text-primary mb-4">Reports</h2>
              <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "userSummary" ? "active" : ""}`}
                    onClick={() => setActiveTab("userSummary")}
                  >
                    User Summary
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "allUsers" ? "active" : ""}`}
                    onClick={() => setActiveTab("allUsers")}
                  >
                    All Users
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "demographics" ? "active" : ""}`}
                    onClick={() => setActiveTab("demographics")}
                  >
                    Demographics
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "qrScan" ? "active" : ""}`}
                    onClick={() => setActiveTab("qrScan")}
                  >
                    Scan QR (Upload)
                  </button>
                </li>
              </ul>
              {renderReportContent()}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default ReportsPage;