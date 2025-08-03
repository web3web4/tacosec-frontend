import { useHome } from "../../context/HomeContext";
import MyData from "../../section/Home/MyData/MyData";
import SharedWithMy from "../../section/Home/SharedWithMy/SharedWithMy";
import "./Home.css";

const Home: React.FC = () => {
  const { activeTab, isLoading, handleAddClick, handleSetActiveTabClick, isInit, provider, userData } = useHome();
  
  if (!isInit || !provider) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="home-container">
      <div className="top-bar">
        <div>{ userData?.firstName } { " " } { userData?.lastName }</div>
        <button className="add-button" onClick={handleAddClick}>
          + Add
        </button>
      </div>
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
        isLoading ? <div className="loading-container-home"> Loading... </div> :
        activeTab === "mydata" ? (
          <MyData />
        ) : (
          <SharedWithMy />
        )} 
        </div>
      </div>
    </div>
  );
};

export default Home;
