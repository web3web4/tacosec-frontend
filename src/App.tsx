import { UserProvider, NavigationGuardProvider, HomeProvider } from "@/context";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Tracker , { SanitizeLevel } from '@openreplay/tracker';
import { WalletProvider } from "@/wallet/walletContext";
import { BottomNav, Loading, AppErrorBoundary, PageErrorBoundary } from "@/components";
import { Home, AddData, Settings } from "@/pages";
import WalletSetup from "@/wallet/WalletSetup";
import { useState, useEffect } from "react";

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => { 
    const tracker = new Tracker({
      projectKey: process.env.REACT_APP_OPENREPLAY_PROJECT_KEY as string,  
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
    <AppErrorBoundary>
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
                        <Route path="/" element={
                          <PageErrorBoundary pageName="Home">
                            <Home />
                          </PageErrorBoundary>
                        } />
                        <Route path="/add" element={
                          <PageErrorBoundary pageName="AddData">
                            <AddData />
                          </PageErrorBoundary>
                        } />
                        <Route path="/settings" element={
                          <PageErrorBoundary pageName="Settings">
                            <Settings />
                          </PageErrorBoundary>
                        } />
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
    </AppErrorBoundary>
  );
};

export default App;