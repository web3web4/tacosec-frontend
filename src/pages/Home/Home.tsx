import { MyData , SharedWithMy} from "@/section";
import { useHome } from "@/context";
import { SectionErrorBoundary, DotsLoader } from "@/components";
import { recordUserAction } from "@/utils";
import { useRef, useEffect, useState } from "react";
import "./Home.css";


const Home: React.FC = () => {
    const { activeTab, isLoading, handleSetActiveTabClick, isInit, provider, fetchMyData, fetchSharedWithMyData } = useHome();
    const tabListRef = useRef<HTMLDivElement>(null);
    const myDataTabRef = useRef<HTMLButtonElement>(null);
    const sharedTabRef = useRef<HTMLButtonElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    
    // Pull to refresh state
    const [pullStartY, setPullStartY] = useState(0);
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isPulling, setIsPulling] = useState(false);

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

    // Pull to refresh handlers
    const handleTouchStart = (e: React.TouchEvent) => {
      const content = contentRef.current;
      if (content && content.scrollTop === 0 && !isRefreshing && !isLoading) {
        setPullStartY(e.touches[0].clientY);
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!isPulling || isRefreshing || isLoading) return;
      
      const content = contentRef.current;
      if (content && content.scrollTop === 0) {
        const currentY = e.touches[0].clientY;
        const distance = currentY - pullStartY;
        
        if (distance > 0) {
          e.preventDefault();
          setPullDistance(Math.min(distance, 120));
        }
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;
      
      setIsPulling(false);
      
      if (pullDistance > 80 && !isRefreshing && !isLoading) {
        setIsRefreshing(true);
        recordUserAction("Pull to refresh");
        
        try {
          if (activeTab === "mydata") {
            await fetchMyData();
          } else {
            await fetchSharedWithMyData();
          }
        } finally {
          setTimeout(() => {
            setIsRefreshing(false);
            setPullDistance(0);
          }, 500);
        }
      } else {
        setPullDistance(0);
      }
      
      setPullStartY(0);
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
    return (
      <div className="loading-container-home" role="status" aria-live="polite">
        <DotsLoader size="large" />
        <span className="sr-only">Loading application...</span>
      </div>
    );
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
          <span className="tab-label">My Secrets</span>
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
        ref={contentRef}
        className="tab-content"
        role="tabpanel"
        id={`${activeTab}-panel`}
        aria-labelledby={`${activeTab}-tab`}
        aria-label={activeTab === "mydata" ? "Your saved secrets" : "Secrets received from others"}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {(isPulling || isRefreshing) && pullDistance > 20 && (
          <div className="pull-to-refresh-indicator" style={{
            opacity: Math.min(pullDistance / 80, 1),
            top: `${Math.min(pullDistance - 40, 40)}px`
          }}>
            {isRefreshing ? (
              <DotsLoader size="small" />
            ) : (
              <span className="refresh-icon">
                {pullDistance > 80 ? '↻' : '↓'}
              </span>
            )}
            <span className="refresh-text">
              {isRefreshing ? 'Refreshing...' : pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        )}
        <div 
          className="tab-content-inner"
          style={{
            transform: `translateY(${pullDistance}px)`,
            transition: isPulling ? 'none' : 'transform 0.3s ease-out'
          }}
        >  
        {
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
