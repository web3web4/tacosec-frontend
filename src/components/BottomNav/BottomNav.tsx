import { useNavigationGuard } from "../../context/NavigationGuardContext";
import { FiHome, FiPlusSquare, FiSettings } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import "./BottomNav.css";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { runNavigationCheck } = useNavigationGuard();

  const handleNavClick = (path: string) => {
    if (location.pathname === path) return;

    if (runNavigationCheck()) {
      Swal.fire({
        icon: "warning",
        title: "Unsaved Changes",
        text: "You have unsaved data. Please save or clear them before navigating.",
      });
      return;
    }

    navigate(path);
  };

  return (
    <nav className="bottom-nav">
      <div
        className={`nav-item ${location.pathname === "/" ? "active" : ""}`}
        onClick={() => handleNavClick("/")}>
        <FiHome className="bottom-nav-icon" />
        <span>Home</span>
      </div>
      <div
        className={`nav-item ${location.pathname === "/add" ? "active" : ""}`}
        onClick={() => handleNavClick("/add")}>
        <FiPlusSquare className="bottom-nav-icon" />
        <span>Add</span>
      </div>
      <div
        className={`nav-item ${location.pathname === "/settings" ? "active" : ""}`}
        onClick={() => handleNavClick("/settings")}>
        <FiSettings className="bottom-nav-icon" />
        <span>Settings</span>
      </div>
    </nav>
  );
}
