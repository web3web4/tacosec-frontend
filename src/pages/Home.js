import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const myDataList = [
    { id: 1, title: "Facebook Pass", status: "Private" },
    { id: 2, title: "Gmail Password", status: "Private" },
  ];

  const sharedDataList = [
    { id: 3, title: "ID", status: "Shared by Joe" },
    { id: 4, title: "Netflix Login", status: "Shared by Amy" },
  ];

  const [activeTab, setActiveTab] = useState("mydata");
  
  const navigate = useNavigate();

  const handleAddClick = () => {
    navigate("/add");
  };

  return (
    <div className="home-container">
      <div className="top-bar">
        <button className="add-button" onClick={handleAddClick}>
          + Add
        </button>
      </div>

      <div className="tabs-row">
        <button
          className={`tab-btn ${activeTab === "mydata" ? "active" : ""}`}
          onClick={() => setActiveTab("mydata")}
        >
          My Data
        </button>
        <button
          className={`tab-btn ${activeTab === "shared" ? "active" : ""}`}
          onClick={() => setActiveTab("shared")}
        >
          Shared With Me
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === "mydata" && (
          <div className="data-list">
            {myDataList.map((item) => (
              <div key={item.id} className="data-item">
                <p className="item-title">{item.title}</p>
                <p className="item-status">Status: {item.status}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "shared" && (
          <div className="data-list">
            {sharedDataList.map((item) => (
              <div key={item.id} className="data-item">
                <p className="item-title">{item.title}</p>
                <p className="item-status">Status: {item.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
