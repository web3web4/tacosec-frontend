import {
  MdPerson,
  MdLock,
  MdVisibility,
  MdAssignment,
  MdHomeWork,
  MdAdminPanelSettings,
} from "react-icons/md";
import { NavLink } from "react-router-dom";
import "./AdminSidebar.css";

const AdminSidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">TACO ADMIN</div>
      <nav className="nav">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) => `navItem ${isActive ? "navItemActive" : ""}`}
        >
          <MdPerson className="navIcon" /> DASHBOARD
        </NavLink>

        <NavLink
          to="/dashboard/users"
          className={({ isActive }) => `navItem ${isActive ? "navItemActive" : ""}`}
        >
          <MdPerson className="navIcon" /> USERS
        </NavLink>

        <NavLink
          to="/dashboard/secrets"
          className={({ isActive }) => `navItem ${isActive ? "navItemActive" : ""}`}
        >
          <MdLock className="navIcon" /> SECRETS
        </NavLink>

        <NavLink
          to="/dashboard/analytics"
          className={({ isActive }) => `navItem ${isActive ? "navItemActive" : ""}`}
        >
          <MdVisibility className="navIcon" /> ANALYTICS
        </NavLink>

        <NavLink
          to="/dashboard/reports"
          className={({ isActive }) => `navItem ${isActive ? "navItemActive" : ""}`}
        >
          <MdAssignment className="navIcon" /> REPORTS
        </NavLink>

        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) => `navItem ${isActive ? "navItemActive" : ""}`}
        >
          <MdAdminPanelSettings className="navIcon" /> SETTINGS
        </NavLink>

        <NavLink
          to="/"
          className={({ isActive }) => `navItem ${isActive ? "navItemActive" : ""}`}
        >
          <MdHomeWork className="navIcon" /> HOME PAGE
        </NavLink>
      </nav>
    </div>
  );
};

export default AdminSidebar;
