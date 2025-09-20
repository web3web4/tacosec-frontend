import { MyData , SharedWithMy} from "@/section";
import { useHome } from "@/context";
import { SectionErrorBoundary } from "@/components";
import "./Home.css";


const Home: React.FC = () => {
    const { activeTab, isLoading, handleSetActiveTabClick, isInit, provider } = useHome();
    
  if (!isInit || !provider) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="home-container">
      <div className="tabs-row">
        <button
          className={`tab-button ${activeTab === "mydata" ? "active" : ""}`}
          onClick={() => handleSetActiveTabClick("mydata")}
        >
          My Data
        </button>
        <button
          className={`tab-button ${activeTab === "shared" ? "active" : ""}`}
          onClick={() => handleSetActiveTabClick("shared")}
        >
          Shared with Me
        </button>
      </div>
      <div className="tab-content">
        <div>  
        {
        isLoading ? (
          <div className="loading-container-home">
            <div className="loading-animation">
              <h2 className="loading-title">
                Loading Your Data
                <span className="loading-dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </h2>
              <div className="loading-spinner"></div>
            </div>
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
