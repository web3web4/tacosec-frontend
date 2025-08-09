import React, { useState, useEffect } from 'react';
import "./Loading.css";

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
        <div className="text-logo">
          <div className="brand-name">TOP LOCK</div>
        </div>
        <div className="spinner"></div>
      </div>
    </div>
  );
};

export default Loading;