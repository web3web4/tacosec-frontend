import React, { useState } from "react";
import CustomPopup from "../../components/CustomPopup/CustomPopup";
import useTaco from "../../hooks/useTaco";
import { useWallet } from "../../wallet/walletContext";
import { conditions, toHexString } from "@nucypher/taco";
import Swal from "sweetalert2";
import { useUser } from "../../context/UserContext";
import { storageEncryptedData } from "../../apiService";
import { parseTelegramInitData } from "../../utils/tools";
import useAddData from "../../hooks/useAddData";
import "./AddData.css";

//type DataType = "text" | "number" | "password";
const ritualId = process.env.REACT_APP_TACO_RITUAL_ID as unknown as number;
const domain = process.env.REACT_APP_TACO_DOMAIN as string;

const AddData: React.FC = () => {
  const {
    userProfile,
    isOpenPopup,
    shareList,
    shareWith,
    setIsOpenPopup,
    setShareWith,
    handleConfirmClick,
    handleAddShare,
  } = useAddData();
  const [message, setMessage] = useState("");
  const [name, setName] = useState<string>("");
  // const [description, setDescription] = useState<string>("");
  //const [type, setType] = useState<DataType>("text");
  const [encrypting, setEncrypting] = useState(false);
  const { provider, signer } = useWallet();
  const { initDataRaw } = useUser();

  const { isInit, encryptDataToBytes } = useTaco({
    domain,
    provider,
    ritualId,
  });
  /*
  useEffect(() => {
    if (encryptedText) {
      console.log("encrypt text from:", encryptedText);
    }
  }, [encryptedText]);
*/
  if (!isInit || !provider) {
    return <div>Loading...</div>;
  }

  const encryptMessage = async () => {
    if (!provider) {
      return;
    }
    setEncrypting(true);
    try {
      if (!signer) {
        console.error("Signer not found", signer);
        return;
      }

      //condation
      const hasPositiveBalance = new conditions.base.rpc.RpcCondition({
        chain: 80002,
        method: "eth_getBalance",
        parameters: [":userAddress", "latest"],
        returnValueTest: {
          comparator: ">=",
          value: 0,
        },
      });

      console.log("Encrypting message...");
      const encryptedBytes = await encryptDataToBytes(
        message,
        hasPositiveBalance,
        signer
      );
      if (encryptedBytes) {
        const encryptedHex = toHexString(encryptedBytes);
        const parsedInitData = parseTelegramInitData(initDataRaw!);
        const usernames: string[] = shareList
          .map((item) => item.data.username)
          .filter((username): username is string => username !== null);

        const res = await storageEncryptedData(
          {
            key: name,
            description: "",
            type:"",
            value: encryptedHex!,
            sharedWith: usernames,
            initData: parsedInitData,
          },
          initDataRaw!
        );
        if (res) {
          Swal.fire({
            icon: "success",
            title: `Encryption successful!`,
          });
        }
      }
    } catch (e) {
      console.log(e);
    }
    setEncrypting(false);
  };

  /*
  const handleSave = (): void => {
    console.log({
      name,
      description,
      type,
      sharedWith: shareList,
    });
    alert("Data saved (console.log)!");
  };
*/
  return (
    <div className="add-data-container">
      {isOpenPopup && (
        <CustomPopup open={isOpenPopup} closed={setIsOpenPopup}>
          <div className="popup-content">
            <img
              src={userProfile.data.img?.src}
              alt="user icon"
              width={80}
              height={80}
            />
            <p>
              {userProfile.error ? userProfile.error : userProfile.data.name}
            </p>
            {!userProfile.error && (
              <button onClick={handleConfirmClick}>Confirmation</button>
            )}
            <button onClick={() => setIsOpenPopup(false)}>Cancel</button>
          </div>
        </CustomPopup>
      )}
      <h2 className="page-title">Add New Data</h2>
      <label>Title</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Facebook Password"
        className="input-field"
      />

      {/* <label>Description</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Short description here..."
        className="input-field"
      /> */}

      <label>Secret</label>
      <textarea
        placeholder="New Data ..."
        className="input-field"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      {encrypting && (
        <div style={{ marginTop: "5px", color: "#ba1b5d", fontWeight: "bold" }}>
          Please Wait For Encrypting...
        </div>
      )}
  {/*
  
  
        <label>Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as DataType)}
          className="input-field"
        >
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="password">Password</option>
        </select>
  */}
      <label>Share with</label>
      <div className="share-with-row">
        <input
          type="text"
          value={shareWith}
          onChange={(e) => setShareWith(e.target.value)}
          placeholder="@user-name"
          className="input-field"
        />
        <button className="add-share-button" onClick={handleAddShare}>
          +
        </button>
      </div>

      {shareList.length > 0 && (
        <div className="share-list">
          <p>Sharing with:</p>
          {shareList.map((user, i) => (
            <div key={i}>- {user.data.name}</div>
          ))}
        </div>
      )}

      <button className="save-button" onClick={encryptMessage}>
        Save
      </button>
    </div>
  );
};

export default AddData;
