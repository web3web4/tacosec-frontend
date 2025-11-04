import { UserProvider, NavigationGuardProvider, HomeProvider, useUser } from "@/context";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Tracker , { SanitizeLevel } from '@openreplay/tracker';
import { WalletProvider } from "@/wallet/walletContext";
import { BottomNav, Loading, AppErrorBoundary, PageErrorBoundary } from "@/components";
import { Home, AddData, Settings , Dashboard , Users, Secrets, Reports } from "@/pages";
import WalletSetup from "@/wallet/WalletSetup";
import { useState, useEffect } from "react";
import { config, getAccessToken} from "@/utils";
import { resetAppOnce, startTokenAutoRefresh, stopTokenAutoRefresh } from "@/utils/authManager";

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  resetAppOnce();
  useEffect(() => { 
    const tracker = new Tracker({
      projectKey: config.OPENREPLAY_PROJECT_KEY,  
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

useEffect(() => {
  const token = getAccessToken();
  if (token) {
    console.log("✅ Starting token auto-refresh loop...");
    startTokenAutoRefresh();
  }else{
    console.warn("⚠️ No access token found on startup.");
  }
  return () => stopTokenAutoRefresh();
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
                        <Route path="/dashboard" element={
                            <PageErrorBoundary pageName="Dashboard">
                              <Dashboard />
                            </PageErrorBoundary>
                        } />
                        <Route path="/dashboard/users" element={
                            <PageErrorBoundary pageName="Users">
                              <Users />
                            </PageErrorBoundary>
                        } />
                        <Route path="/dashboard/secrets" element={
                            <PageErrorBoundary pageName="Secrets">
                              <Secrets />
                            </PageErrorBoundary>
                        } />
                        <Route path="/dashboard/reports" element={
                            <PageErrorBoundary pageName="Reports">
                              <Reports />
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