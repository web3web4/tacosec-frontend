import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FiHome, 
  FiPlusSquare, 
  FiSettings 
} from "react-icons/fi";
import "./BottomNav.css";

const BottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      <Link 
        to="/" 
        className={location.pathname === "/" ? "active" : ""}
      >
        <FiHome className="bottom-nav-icon" />
        <span>Home</span>
      </Link>
      <Link 
        to="/add" 
        className={location.pathname === "/add" ? "active" : ""}
      >
        <FiPlusSquare className="bottom-nav-icon" />
        <span>Add</span>
      </Link>
      <Link 
        to="/settings" 
        className={location.pathname === "/settings" ? "active" : ""}
      >
        <FiSettings className="bottom-nav-icon" />
        <span>Settings</span>
      </Link>
    </nav>
  );
};

export default BottomNav;