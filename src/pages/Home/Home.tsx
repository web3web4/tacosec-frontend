import { MyData , SharedWithMy} from "@/section";
import { useHome } from "@/context";
import { SectionErrorBoundary, DotsLoader } from "@/components";
import { recordUserAction } from "@/utils";
import { useRef, useEffect } from "react";
import "./Home.css";


const Home: React.FC = () => {
    const { activeTab, isLoading, handleSetActiveTabClick, isInit, provider } = useHome();
    const tabListRef = useRef<HTMLDivElement>(null);
    const myDataTabRef = useRef<HTMLButtonElement>(null);
    const sharedTabRef = useRef<HTMLButtonElement>(null);

    // Keyboard navigation for tabs
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, tab: "mydata" | "shared") => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const newTab = tab === "mydata" ? "shared" : "mydata";
        handleSetActiveTabClick(newTab);
        // Focus the other tab
        setTimeout(() => {
          if (newTab === "mydata") {
            myDataTabRef.current?.focus();
          } else {
            sharedTabRef.current?.focus();
          }
        }, 0);
      }
    };

    // Focus active tab on mount
    useEffect(() => {
      if (activeTab === "mydata") {
        myDataTabRef.current?.focus();
      } else {
        sharedTabRef.current?.focus();
      }
    }, []);
    
  if (!isInit || !provider) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="home-container">
      <div className="tabs-row" ref={tabListRef} role="tablist" aria-label="Secret Management Tabs" data-active-tab={activeTab}>
        <button
          ref={myDataTabRef}
          className={`tab-button ${activeTab === "mydata" ? "active" : ""}`}
          onClick={() => {
            recordUserAction("Tab click: My Data");
            handleSetActiveTabClick("mydata");
          }}
          onKeyDown={(e) => handleKeyDown(e, "mydata")}
          role="tab"
          aria-selected={activeTab === "mydata"}
          aria-controls="mydata-panel"
          id="mydata-tab"
          tabIndex={activeTab === "mydata" ? 0 : -1}
        >
          <svg className="tab-icon" width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="8" width="14" height="9" stroke="currentColor" strokeWidth="2" />
            <path d="M4 8V5C4 2.79086 5.79086 1 8 1C10.2091 1 12 2.79086 12 5V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="tab-label">Saved Secrets</span>
        </button>
        <button
          ref={sharedTabRef}
          className={`tab-button ${activeTab === "shared" ? "active" : ""}`}
          onClick={() => {
            recordUserAction("Tab click: Shared With Me");
            handleSetActiveTabClick("shared");
          }}
          onKeyDown={(e) => handleKeyDown(e, "shared")}
          role="tab"
          aria-selected={activeTab === "shared"}
          aria-controls="shared-panel"
          id="shared-tab"
          tabIndex={activeTab === "shared" ? 0 : -1}
        >
          <svg className="tab-icon" width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="16" height="12" stroke="currentColor" strokeWidth="2" />
            <path d="M1 1L9 8L17 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="tab-label">Received Secrets</span>
        </button>
      </div>

      <div 
        className="tab-content"
        role="tabpanel"
        id={`${activeTab}-panel`}
        aria-labelledby={`${activeTab}-tab`}
      >
        <div>  
        {
        isLoading ? (
          <div className="loading-container-home" role="status" aria-label="Loading secrets">
            <DotsLoader size="large" />
          </div>
        ) :
        activeTab === "mydata" ? (
          <SectionErrorBoundary sectionName="MyData">
            <MyData />
          </SectionErrorBoundary>
        ) : (
          <SectionErrorBoundary sectionName="SharedWithMy">
            <SharedWithMy />
          </SectionErrorBoundary>
        )} 
        </div>
      </div>
    </div>
  );
};

export default Home;
