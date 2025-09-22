import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';

// Import dashboard components for each user type
import AdminDashboard from './user_view/AdminDashboard.jsx';
import DoctorDashboard from './user_view/DoctorDashboard.jsx';
import PatientDashboard from './user_view/PatientDashboard.jsx';
import MyPatient from './docterView/MyPatient.jsx';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // JWT token එක local storage එකෙන් ලබා ගැනීම
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      // API එකට request එකක් යවලා user ගේ විස්තර ලබා ගැනීම
      axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setUser(response.data.user);
      })
      .catch(error => {
        console.error(error);
        localStorage.removeItem('token');
        navigate('/login');
      });
    }
  }, [navigate]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const renderDashboardContent = () => {
    switch (user.userType) {
      case 'admin':
        return <AdminDashboard />;
        
      case 'doctor':
        return <DoctorDashboard />;
        // return <MyPatient/>;
      case 'patient':
        return <PatientDashboard />;
       
      default:
        return <div>Welcome to the Dashboard!</div>;
    }
  };

  return (
    <div className="dashboard-layout">
      <Header user={user} />
      <div className="main-content-wrapper">
        <Sidebar userType={user.userType} />
        <div className="main-content-area">
          {renderDashboardContent()}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;