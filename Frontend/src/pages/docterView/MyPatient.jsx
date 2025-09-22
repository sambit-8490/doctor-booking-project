import React, { useEffect, useState } from "react";
import Header from "../../components/Header.jsx";
import Sidebar from "../../components/Sidebar.jsx";
import axios from "axios";
import "./MyPatient.css"; // ✅ import the CSS

function MyPatient() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [uploadingId, setUploadingId] = useState(null); // Track which patient is uploading

  const token = localStorage.getItem("token");

  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
    } catch (err) {
      console.error(err);
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/patients/my-patients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(res.data.patients);
    } catch (err) {
      console.error(err);
      alert("Error fetching patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchPatients();
  }, []);

  const handleFileUpload = async (patientId, file) => {
    if (!file) return;
    setUploadingId(patientId);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        `/api/patients/upload/${patientId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("PDF uploaded successfully!");
      // Optionally update the patient list with new PDF path
      fetchPatients();
    } catch (err) {
      console.error(err);
      alert("Failed to upload PDF.");
    } finally {
      setUploadingId(null);
    }
  };

  if (!user) return <div className="loading-text">Loading...</div>;

  return (
    <div className="dashboard-layout">
      <Header user={user} />
      <div className="main-content-wrapper" style={{ display: "flex" }}>
        <Sidebar userType={user.userType} />
        <main className="main-content-area">
          <h2>My Patients</h2>
          {loading ? (
            <p className="loading-text">Loading patients...</p>
          ) : patients.length > 0 ? (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone Number</th>
                    <th>Condition PDF</th> {/* New column */}
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p._id}>
                      <td>{p.fullName}</td>
                      <td>{p.email}</td>
                      <td>{p.phoneNumber}</td>
                      <td>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) =>
                            handleFileUpload(p._id, e.target.files[0])
                          }
                          disabled={uploadingId === p._id}
                        />
                        {p.conditionPDF && (
                          <a
                            href={`http://localhost:5000/${p.conditionPDF}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ marginLeft: "8px" }}
                          >
                            View
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-patients">No patients found.</p>
          )}
        </main>
      </div>
    </div>
  );
}

export default MyPatient;
