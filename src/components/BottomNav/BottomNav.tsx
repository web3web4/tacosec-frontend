import { FiHome, FiPlusSquare, FiSettings } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import { useNavigationGuard, useUser } from "@/context";
import { MetroSwal, recordUserAction } from "@/utils";
import "./BottomNav.css";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { runNavigationCheck } = useNavigationGuard();
  const { userData, isBrowser } = useUser();

  const handleNavClick = (path: string) => {
    if (location.pathname === path) return;

    if (runNavigationCheck()) {
      MetroSwal.warning(
        "Unsaved changes",
        "You have unsaved edits. Please save or clear them before leaving this page."
      );
      return;
    }

    recordUserAction(`Navigation: ${location.pathname} → ${path}`);
    navigate(path);
  };

  const isAdmin = userData?.role === "admin" && isBrowser;

  return (
    <nav className="bottom-nav">
      <div
        className={`nav-item ${location.pathname === "/" ? "active" : ""}`}
        onClick={() => handleNavClick("/")}>
        <FiHome className="bottom-nav-icon" />
        <span className="bottom-nav-text">Home</span>
      </div>
      <div
        className={`nav-item ${location.pathname === "/add" ? "active" : ""}`}
        onClick={() => handleNavClick("/add")}>
        <FiPlusSquare className="bottom-nav-icon" />
        <span className="bottom-nav-text">Add</span>
      </div>
      <div
        className={`nav-item ${location.pathname === "/settings" ? "active" : ""}`}
        onClick={() => handleNavClick("/settings")}>
        <FiSettings className="bottom-nav-icon" />
        <span className="bottom-nav-text">Settings</span>
      </div>
      {isAdmin && (
        <div
          className={`nav-item ${location.pathname.startsWith("/dashboard") ? "active" : ""}`}
          onClick={() => handleNavClick("/dashboard")}>
          <MdDashboard className="bottom-nav-icon" />
          <span className="bottom-nav-text">Dashboard</span>
        </div>
      )}
    </nav>
  );
}
