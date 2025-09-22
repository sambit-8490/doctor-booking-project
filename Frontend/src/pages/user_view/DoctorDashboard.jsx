import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import "./DoctorDashboard.css";

function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token"); // JWT from login

  // Fetch doctor's appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/appointments/doctor/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data.appointments);
    } catch (err) {
      console.error(err);
      alert("Error fetching appointments.");
    } finally {
      setLoading(false);
    }
  };

  // Update appointment status
  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `/api/appointments/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAppointments(); // refresh after update
    } catch (err) {
      console.error(err);
      alert("Error updating status.");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="dashboard-content p-4">
      <h2 className="text-2xl font-bold mb-2">Doctor Dashboard</h2>
      <p className="mb-4">Welcome, Doctor. Here is an overview of your upcoming schedule and patient information.</p>

      <div className="dashboard-card mb-6">
        <h3 className="text-xl font-semibold mb-2">Upcoming Appointments</h3>
        {loading ? (
          <p>Loading appointments...</p>
        ) : appointments.length > 0 ? (
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2">Date</th>
                <th className="border px-3 py-2">Time</th>
                <th className="border px-3 py-2">Patient</th>
                <th className="border px-3 py-2">Email</th>
                <th className="border px-3 py-2">Status</th>
                <th className="border px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => {
                const date = new Date(appt.date);
                return (
                  <tr key={appt._id} className="text-center">
                    <td className="border px-3 py-2">{date.toDateString()}</td>
                    <td className="border px-3 py-2">{date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="border px-3 py-2">{appt.patient?.fullName}</td>
                    <td className="border px-3 py-2">{appt.patient?.email}</td>
                    <td className="border px-3 py-2">{appt.status}</td>
                    <td className="border px-3 py-2 space-x-1">
                      {appt.status !== "confirmed" && (
                        <button
                          className="bg-blue-500 text-white px-2 py-1 rounded"
                          onClick={() => updateStatus(appt._id, "confirmed")}
                        >
                          Confirm
                        </button>
                      )}
                      {appt.status !== "completed" && (
                        <button
                          className="bg-green-500 text-white px-2 py-1 rounded"
                          onClick={() => updateStatus(appt._id, "completed")}
                        >
                          Complete
                        </button>
                      )}
                      {appt.status !== "cancelled" && (
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded"
                          onClick={() => updateStatus(appt._id, "cancelled")}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>No upcoming appointments.</p>
        )}
      </div>

      <div className="dashboard-card">
        <h3 className="text-xl font-semibold mb-2">Quick Actions</h3>
        <NavLink to="/my-patients" className="btn btn-primary me-2">View My Patients</NavLink>
        <NavLink to="/appointments" className="btn btn-secondary">Manage Appointments</NavLink>
      </div>
    </div>
  );
}

export default DoctorDashboard;