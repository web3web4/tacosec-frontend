import { useState } from "react";
import { useWallet } from "../../wallet/walletContext";
import useHome from "../../hooks/useHome";
import useTaco from "../../hooks/useTaco";
import { fromHexString } from "@nucypher/shared";
import { fromBytes } from "@nucypher/taco";
import "./Home.css";
import MyData from "../../section/Home/MyData/MyData";
import SharedWithMy from "../../section/Home/SharedWithMy/SharedWithMy";


// need refactor
const Home: React.FC = () => {
  const { myData, sharedWithMyData, activeTab, handleAddClick, handlesetActiveTabClick } = useHome();
  const { signer, provider } = useWallet();
  console.log("this is wallet" ,signer);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [decryptedMessages, setDecryptedMessages] = useState<Record<number, string>>({});
  const [decrypting, setDecrypting] = useState<boolean>(false);

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
        <div>
        {activeTab === "mydata" ? (
          <MyData myData={myData} toggleExpand={toggleExpand} expandedIndex={expandedIndex} decrypting={decrypting} decryptedMessages={decryptedMessages} />
        ) : (
          <SharedWithMy sharedWithMyData={sharedWithMyData} toggleExpand={toggleExpand} expandedIndex={expandedIndex} decrypting={decrypting} decryptedMessages={decryptedMessages} />
        )}
        </div>
      </div>
    </div>
  );
};

export default Home;
