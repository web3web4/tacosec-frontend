import React from "react";
import { MdPerson, MdLock, MdVisibility, MdAssignment, MdHomeWork, MdAdminPanelSettings } from "react-icons/md";
import { NavLink } from "react-router-dom";
import "./AdminSidebar.css";

const AdminSidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">TACO ADMIN</div>
      <nav className="nav">
        <NavLink to="/dashboard" className="navItem navItemActive">
          <MdPerson className="navIcon" /> DASHBOARD
        </NavLink>
        <NavLink to="/dashboard/users" className="navItem">
          <MdPerson className="navIcon" /> USERS
        </NavLink>
        <NavLink to="/dashboard/secrets" className="navItem">
          <MdLock className="navIcon" /> SECRETS
        </NavLink>
        <NavLink to="/dashboard/analytics" className="navItem">
          <MdVisibility className="navIcon" /> ANALYTICS
        </NavLink>
        <NavLink to="/dashboard/reports" className="navItem">
          <MdAssignment className="navIcon" /> REPORTS
        </NavLink>
        <NavLink to="/dashboard/settings" className="navItem">
          <MdAdminPanelSettings className="navIcon" /> SETTINGS
        </NavLink>
        <NavLink to="/" className="navItem">
          <MdHomeWork className="navIcon" /> HOME PAGE
        </NavLink>
      </nav>
    </div>
  );
};

export default AdminSidebar;
