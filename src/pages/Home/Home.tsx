import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../wallet/walletContext";
import useHome from "../../hooks/useHome";
import useTaco from "../../hooks/useTaco";
import { fromHexString } from "@nucypher/shared";
import { fromBytes } from "@nucypher/taco";
import "./Home.css";

const Home: React.FC = () => {
  const { data, activeTab, handleAddClick, handlesetActiveTabClick } = useHome();
  const { signer, provider } = useWallet();
  console.log("this is wallet" ,signer);
  const navigate = useNavigate();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [decryptedMessages, setDecryptedMessages] = useState<Record<number, string>>({});
  const [decrypting, setDecrypting] = useState(false);

  const ritualId = process.env.REACT_APP_TACO_RITUAL_ID as unknown as number;
  const domain = process.env.REACT_APP_TACO_DOMAIN as string;
  const { isInit, decryptDataFromBytes } = useTaco({
    domain,
    provider,
    ritualId,
  });

  if (!isInit || !provider) {
    return <div>Loading...</div>;
  }
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleEdit = (id: string) => {
    navigate(`/edit/${id}`);
  };

  const toggleExpand = (index: number, value: string) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
      if (!decryptedMessages[index]) {
        decryptMessage(index, value);
      }
    }
  };

  const decryptMessage = async (index: number, encryptedText: string) => {
    if (!encryptedText || !provider || !signer) return;
    try {
      setDecrypting(true);
      console.log("Decrypting message...");
      const decryptedBytes = await decryptDataFromBytes(
        fromHexString(encryptedText),
        signer
      );
      if (decryptedBytes) {
        const decrypted = fromBytes(decryptedBytes);
        setDecryptedMessages((prev) => ({ ...prev, [index]: decrypted }));
      }
    } catch (e) {
      console.error("Error decrypting:", e);
    } finally {
      setDecrypting(false);
    }
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
          {data.length > 0 ? (
            data.map((item, i) => (
              <div
                key={i}
                className="data-item"
                onClick={() => toggleExpand(i, item.value)}
              >
                <p className="item-title">{item.key}</p>
                <p
                  className="item-status"
                  data-status={
                    item.sharedWith.length > 0 ? "Shared" : "Private"
                  }
                >
                  {item.sharedWith.length > 0 ? "Shared" : "Private"}
                </p>
                {expandedIndex === i && (
                  <div className="expanded-box">
                    <p className="password-text">
                      Secret:{" "}
                      {decrypting ? (
                        <span className="decrypting-animation">
                          Decrypting
                          <span className="dots">
                            <span>.</span>
                            <span>.</span>
                            <span>.</span>
                          </span>
                        </span>
                      ) : (
                        decryptedMessages[i] || "Failed to decrypt"
                      )}
                    </p>

                    <div className="button-group">
                      <button
                        className="copy-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (decryptedMessages[i])
                            handleCopy(decryptedMessages[i]);
                        }}
                      >
                        Copy
                      </button>
                      <button
                        className="edit-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(item.id);
                        }}
                      >
                        Edit
                      </button>
                    </div>
                    {item.sharedWith.length > 0 && (
                      <div className="shared-section">
                        {" "}
                        <h4 className="shared-title">Shared With:</h4>
                        <div className="shared-users">
                          {item.shareWithDetails?.map((user, index) => (
                            <div className="shared-user" key={index}>
                              <img src={user.img?.src} alt="img"/>
                              <span>{user.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="no-data-message">No data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
