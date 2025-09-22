import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css'; // ඔබට අවශ්‍ය CSS ෆයිල් එක

function Sidebar({ userType }) {
  // userType එක අනුව මෙනු ලැයිස්තුව තීරණය කිරීම
  const getMenuItems = () => {
    switch (userType) {
      case 'admin':
        return (
          <>
            <NavLink to="/dashboard" end>Dashboard</NavLink>
            <NavLink to="/patients">Patient Management</NavLink>
            <NavLink to="/doctors">Doctor Management</NavLink>
            <NavLink to="/reports">Reports</NavLink>
          </>
        );
      case 'doctor':
        return (
          <>
            <NavLink to="/dashboard" end>Dashboard</NavLink>
            <NavLink to="/my-patients">My Patients</NavLink>
            <NavLink to="/appointments">Appointments</NavLink>
          </>
        );
      case 'patient':
        return (
          <>
            <NavLink to="/dashboard" end>Dashboard</NavLink>
            <NavLink to="/my-records">My Records</NavLink>
            <NavLink to="/book-appointment">Book Appointment</NavLink>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <aside className="main-sidebar">
      <nav className="menu-nav">
        {getMenuItems()}
      </nav>
    </aside>
  );
}

export default Sidebar;