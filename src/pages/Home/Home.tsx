import { useHome } from "../../context/HomeContext";
import MyData from "../../section/Home/MyData/MyData";
import SharedWithMy from "../../section/Home/SharedWithMy/SharedWithMy";
import "./Home.css";

const Home: React.FC = () => {
  const { activeTab, isLoading, handleAddClick, handleSetActiveTabClick, isInit, provider, userData } = useHome();
  
  const { myData, sharedWithMyData, activeTab, handleDelete, handlesetActiveTabClick } = useHome();
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
