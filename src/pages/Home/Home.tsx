import { useWallet } from "../../wallet/walletContext";
import { useUser } from "../../context/UserContext";
import useHome from "../../hooks/useHome";
import "./Home.css";

const Home: React.FC = () => {
  const { data, activeTab, handleAddClick, handlesetActiveTabClick } = useHome();
  const { signer } = useWallet();
  console.log("this wallet for user", signer);
  const { userData } = useUser();
  console.log("this is data user telegram", userData);

  return (
    <div className="home-container">
      <div className="top-bar">
        <button className="add-button" onClick={handleAddClick}>
          + Add
        </button>
      </div>
      <div className="tabs-row">
        <button
          className={`tab-button ${activeTab === "mydata" ? "active" : ""}`}
          onClick={() => handlesetActiveTabClick("mydata")}
        >
          My Data
        </button>
        <button
          className={`tab-button ${activeTab === "shared" ? "active" : ""}`}
          onClick={() => handlesetActiveTabClick("shared")}
        >
          Shared With Me
        </button>
      </div>

      <div className="tab-content">
          <div className="data-list">
            {data.map((item, i) => (
              <div key={i} className="data-item">
                <p className="item-title">{item.key}</p>
                <p className="item-status" data-status={"Private"}>
                  {"Private"}
                </p>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
};

export default Home;
