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
import { recordUserAction } from "@/utils";

const AdminSidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">TACOSec ADMIN</div>
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
          onClick={() => recordUserAction('view_users')}
          className={({ isActive }) => `navItem ${isActive ? "navItemActive" : ""}`}
        >
          <MdPerson className="navIcon" /> USERS
        </NavLink>

        <NavLink
          to="/dashboard/secrets"
          onClick={() => recordUserAction('view_secrets')}
          className={({ isActive }) => `navItem ${isActive ? "navItemActive" : ""}`}
        >
          <MdLock className="navIcon" /> SECRETS
        </NavLink>

        <NavLink
          to="/dashboard/analytics"
          onClick={() => recordUserAction('view_analytics')}
          className={({ isActive }) => `navItem ${isActive ? "navItemActive" : ""}`}
        >
          <MdVisibility className="navIcon" /> ANALYTICS
        </NavLink>

        <NavLink
          to="/dashboard/reports"
          onClick={() => recordUserAction('view_reports')}
          className={({ isActive }) => `navItem ${isActive ? "navItemActive" : ""}`}
        >
          <MdAssignment className="navIcon" /> REPORTS
        </NavLink>

        <NavLink
          to="/dashboard/settings"
          onClick={() => recordUserAction('view_settings')}
          className={({ isActive }) => `navItem ${isActive ? "navItemActive" : ""}`}
        >
          <MdAdminPanelSettings className="navIcon" /> SETTINGS
        </NavLink>

        <NavLink
          to="/"
          onClick={() => recordUserAction('view_home_page')}
          className={({ isActive }) => `navItem ${isActive ? "navItemActive" : ""}`}
        >
          <MdHomeWork className="navIcon" /> HOME PAGE
        </NavLink>
      </nav>
    </div>
  );
};

export default AdminSidebar;
