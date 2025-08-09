import React, { useState, useEffect } from 'react';
import "./Loading.css";
import Logo from "../../assets/icons/Logo.png";

const Loading: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="loading-container">
      <div className="logo-background">
        <div className="logo-container">
          <img src={Logo} alt="Logo" className="logo-image" />
        </div>
      </div>
    </div>
  );
};

export default Loading;