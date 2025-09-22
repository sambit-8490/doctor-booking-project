// src/App.jsx

import { Routes, Route } from "react-router-dom";
import { Navigate, Outlet } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import "./App.css";
import PatientManagement from "./pages/user_view/PatientManagement.jsx";
import DoctorManagement from "./pages/user_view/DoctorManagement.jsx";
import MyRecordsPage from "./pages/user_view/MyRecordsPage.jsx";
import BookAppointmentPage from "./pages/user_view/BookAppointmentPage.jsx";
import ReportsPage from "./pages/user_view/ReportsPage.jsx";

// ✅ Appointments
import AppointmentsCalendar from "./pages/user_view/AppointmentsCalendar.jsx";
import AppointmentsManagement from "./pages/user_view/AppointmentsManagement.jsx";

// ✅ Doctor’s Patients
import MyPatient from "./pages/docterView/MyPatient.jsx" // 👈 import your new page

const PrivateRoute = () => {
  const isAuthenticated = localStorage.getItem("token");
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Default redirect */}
        <Route path="/" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/patients" element={<PatientManagement />} />
          <Route path="/doctors" element={<DoctorManagement />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/my-records" element={<MyRecordsPage />} />
          <Route path="/book-appointment" element={<BookAppointmentPage />} />

          {/* ✅ Appointment routes */}
          <Route path="/appointments" element={<AppointmentsManagement />} />
          <Route path="/calendar" element={<AppointmentsCalendar />} />

          {/* ✅ Doctor-specific patient page */}
          <Route path="/my-patient/:id" element={<MyPatient />} /> 
          <Route path="/my-patients" element={<MyPatient />} />


        </Route>
      </Routes>
    </div>
  );
}

export default App;
