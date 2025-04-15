import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import AddData from "./pages/AddData/AddData";
import Settings from "./pages/Settings/Settings";
import BottomNav from "./components/BottomNav/BottomNav";
import Loading from "./components/Loading/Loading";

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <div className="app-container">
        {isLoading && <Loading />}

        {!isLoading && (
          <>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/add" element={<AddData />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>

            <BottomNav />
          </>
        )}
      </div>
    </Router>
  );
};

export default App; 