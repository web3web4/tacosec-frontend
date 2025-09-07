import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import AddData from "./pages/AddData/AddData";
import Settings from "./pages/Settings/Settings";
import BottomNav from "./components/BottomNav/BottomNav";
import Loading from "./components/Loading/Loading";
import { WalletProvider } from "./wallet/walletContext";
import { UserProvider } from "./context/UserContext";
import { NavigationGuardProvider } from "./context/NavigationGuardContext";
import { HomeProvider } from "./context/HomeContext";
import WalletSetup from "./wallet/WalletSetup";
import Tracker , { SanitizeLevel } from '@openreplay/tracker';


const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const tracker = new Tracker({
      projectKey: "OBRRxhO5bKmUOOdoVd4Y",  
      obscureTextEmails: true,
      obscureTextNumbers: true,
      obscureInputEmails: true,
      obscureInputDates: true,
      obscureInputNumbers: true,
      domSanitizer: (node: Element) => {
        const sensitiveClasses = [ "child-date", "password-text", "shared-user", "child-secret", "address-value", "seed-word" ];
        for (let className of sensitiveClasses) {
          if (node.classList.contains(className)) {
            return SanitizeLevel.Obscured; 
          }
        }
        return SanitizeLevel.Plain;
      }
    });
    tracker.start()
    return () => { tracker.stop() };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <UserProvider>
      <NavigationGuardProvider>
      <WalletProvider>
        <WalletSetup />
        <Router>
          <div className="app-container">
            {isLoading && <Loading />}

            {!isLoading && (
              <>
                <HomeProvider>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/add" element={<AddData />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </HomeProvider>
                <BottomNav />
              </>
            )}
          </div>
        </Router>
      </WalletProvider>
      </NavigationGuardProvider>
    </UserProvider>
  );
};

export default App;