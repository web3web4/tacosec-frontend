import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./BottomNav.css";

function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      <Link 
        to="/" 
        className={location.pathname === "/" ? "active" : ""}
      >
        Home
      </Link>
      <Link 
        to="/add" 
        className={location.pathname === "/add" ? "active" : ""}
      >
        Add
      </Link>
      <Link 
        to="/settings" 
        className={location.pathname === "/settings" ? "active" : ""}
      >
        Setting
      </Link>
    </nav>
  );
}

export default BottomNav;
