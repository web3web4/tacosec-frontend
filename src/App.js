import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import AddData from "./pages/AddData";
import Settings from "./pages/Settings";
import BottomNav from "./components/BottomNav";
import Loading from "./components/Loading";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
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
}

export default App;
