import { MyData , SharedWithMy} from "@/section";
import { useHome } from "@/context";
import { SectionErrorBoundary, DotsLoader } from "@/components";
import { recordUserAction } from "@/utils";
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
          onClick={() => {
            recordUserAction("Tab click: My Data");
            handleSetActiveTabClick("mydata");
          }}
        >
          My Data
        </button>
        <button
          className={`tab-button ${activeTab === "shared" ? "active" : ""}`}
          onClick={() => {
            recordUserAction("Tab click: Shared With Me");
            handleSetActiveTabClick("shared");
          }}
        >
          Shared with Me
        </button>
      </div>
      <div className="tab-content">
        <div>  
        {
        isLoading ? (
          <div className="loading-container-home">
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
