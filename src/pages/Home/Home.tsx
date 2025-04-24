import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { useWallet } from "../../wallet/walletContext";
import { useUser } from "../../context/UserContext";

interface DataItem {
  id: number;
  title: string;
  status: string;
}


const Home: React.FC = () => {
  const { signer   } = useWallet();
  console.log("this wallet for user", signer);

  const myDataList: DataItem[] = [
    { id: 1, title: "Facebook Pass", status: "Private" },
    { id: 2, title: "Gmail Password", status: "Private" },
  ];

  const sharedDataList: DataItem[] = [
    { id: 3, title: "ID", status: "Shared by Joe" },
    { id: 4, title: "Netflix Login", status: "Shared by Amy" },
  ];

  const [activeTab, setActiveTab] = useState<string>("mydata");
  const navigate = useNavigate();

  const handleAddClick = (): void => {
    navigate("/add");
  };

  return (
    <div className="home-container">
      <div className="top-bar">
        <button className="add-button" onClick={handleAddClick}>
          + Add
        </button>
      </div>
      {/* ========= For Test ========== */}
      <button className="add-button" onClick={() => navigate("/encyptyingg")}>
      go to encyptying
        </button>
      {/* ========= For Test ========== */}

      <div className="tabs-row">
        <button
          className={`tab-button ${activeTab === "mydata" ? "active" : ""}`}
          onClick={() => setActiveTab("mydata")}
        >
          My Data
        </button>
        <button
          className={`tab-button ${activeTab === "shared" ? "active" : ""}`}
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
                <p className="item-status" data-status={item.status}>
                  {item.status}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "shared" && (
          <div className="data-list">
            {sharedDataList.map((item) => (
              <div key={item.id} className="data-item">
                <p className="item-title">{item.title}</p>
                <p className="item-status" data-status={item.status}>
                  {item.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;