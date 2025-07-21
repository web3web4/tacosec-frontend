import useHome from "../../hooks/useHome";
import MyData from "../../section/Home/MyData/MyData";
import SharedWithMy from "../../section/Home/SharedWithMy/SharedWithMy";
import "./Home.css";

const Home: React.FC = () => {
  const { myData, sharedWithMyData, activeTab, isLoading, handleAddClick, handleSetActiveTabClick, handleDelete, handleReportUser, handleViewReportsForSecret, isInit, provider, userData, decrypting, decryptedMessages, toggleExpand, expandedIndex, toggleChildExpand, expandedChildIndex, decryptingChild, decryptedChildMessages } = useHome();
  
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
          <MyData  myData={myData} toggleExpand={toggleExpand} expandedIndex={expandedIndex} decrypting={decrypting} decryptedMessages={decryptedMessages} handleDelete={handleDelete} toggleChildExpand={toggleChildExpand} expandedChildIndex={expandedChildIndex} decryptingChild={decryptingChild} decryptedChildMessages={decryptedChildMessages}
          />
        ) : (
          <SharedWithMy sharedWithMyData={sharedWithMyData} toggleExpand={toggleExpand} expandedIndex={expandedIndex} decrypting={decrypting} decryptedMessages={decryptedMessages} handleReportUser={handleReportUser} handleViewReportsForSecret={handleViewReportsForSecret} toggleChildExpand={toggleChildExpand} expandedChildIndex={expandedChildIndex} decryptingChild={decryptingChild} decryptedChildMessages={decryptedChildMessages}/>
        )}
        </div>
      </div>
    </div>
  );
};

export default Home;
