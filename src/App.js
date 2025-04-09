import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import AddData from "./pages/AddData";
import Settings from "./pages/Settings";
import BottomNav from "./components/BottomNav";
import Loading from "./components/Loading"; // Import the Loading component

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading process for 3 seconds before showing the main content
    setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Adjust the time (3000ms = 3 seconds)
  }, []);

  return (
    <Router>
      <div className="app-container">
        {/* Show loading screen while the app is loading */}
        {isLoading && <Loading />}

        {/* Only render the routes and bottom nav after loading is complete */}
        {!isLoading && (
          <>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/add" element={<AddData />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>

            {/* Bottom navigation stays visible on all screens */}
            <BottomNav />
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
