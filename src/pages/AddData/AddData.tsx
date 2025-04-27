import React, { useState , useEffect } from "react";
import "./AddData.css";
import CustomPopup from "../../components/CustomPopup/CustomPopup";
import defaultImage from "../../assets/images/no-User.png";
import useTaco from '../../hooks/useTaco';
import { useWallet } from '../../wallet/walletContext';
import { conditions,  toHexString } from '@nucypher/taco';
import Swal from "sweetalert2";


type DataType = "text" | "number" | "password";
const ritualId = process.env.REACT_APP_TACO_RITUAL_ID as unknown as number; 
const domain = process.env.REACT_APP_TACO_DOMAIN as string;

const AddData: React.FC = () => {
  const [message, setMessage] = useState('');
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [type, setType] = useState<DataType>("text");
  const [shareWith, setShareWith] = useState<string>("");
  const [shareList, setShareList] = useState<string[]>([]);
  const [isOpenPopup, setIsOpenPopup] = useState<boolean>(false);
  const [encrypting, setEncrypting] = useState(false);
  const [encryptedText, setEncryptedText] = useState<string | undefined>('');
  const { provider  , signer } = useWallet();

  const { isInit, encryptDataToBytes } = useTaco({
    domain,
    provider,
    ritualId,
  });

  useEffect(() => {
    if (encryptedText) {
      console.log("encrypt text from:", encryptedText);
    }
  }, [encryptedText]);

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
      const signerr = signer;
      console.log(signerr);
      //condation
      const hasPositiveBalance = new conditions.base.rpc.RpcCondition({
        chain: 80002,
        method: 'eth_getBalance',
        parameters: [':userAddress', 'latest'],
        returnValueTest: {
          comparator: '>=',
          value: 0,
        },
      });

      console.log('Encrypting message...');
      const encryptedBytes = await encryptDataToBytes(
        message,
        hasPositiveBalance,
        signerr,
      );
      if (encryptedBytes) {
        const encryptedHex = toHexString(encryptedBytes);
        setEncryptedText(encryptedHex);
        Swal.fire({
          icon: 'success',
          title: `Encryption successful!`,
          showCancelButton: true,
          //timer: 1500
        });
        console.log('Encrypted message:', encryptedText);
      }
    } catch (e) {
      console.log(e);
    }
    setEncrypting(false);
  };

  const handleAddShare = (): void => {
    if (!shareWith.trim()) return;
    setIsOpenPopup(true);
  };

  const handleConfirmClick = (): void => {
    setShareList([...shareList, shareWith]);
    setIsOpenPopup(false);
    setShareWith("");
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
      {isOpenPopup && <CustomPopup open={isOpenPopup} closed={setIsOpenPopup}>
          <div className="popup-content">
            <img src={defaultImage} alt="user icon" width={80} height={80}/>
            {shareWith}
            <button onClick={handleConfirmClick}>confirmation</button>
          </div>
        </CustomPopup>}
      <h2 className="page-title">Add New Data</h2>
      <label>Name of Data</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Facebook Password"
        className="input-field"
      />

      <label>Description</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Short description here..."
        className="input-field"
      />

      <label>Value</label>
      <textarea
        placeholder="New Data ..."
        className="input-field"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

    {encrypting && (
      <div style={{ marginTop: '5px', color: '#ba1b5d', fontWeight: 'bold' }}>
        Please Wait For Encrypting...
      </div>
    )}

      <label>Type</label>
      <select value={type} onChange={(e) => setType(e.target.value as DataType)} className="input-field">
        <option value="text">Text</option>
        <option value="number">Number</option>
        <option value="password">Password</option>
      </select>

      <label>Share with</label>
      <div className="share-with-row">
        <input
          type="text"
          value={shareWith}
          onChange={(e) => setShareWith(e.target.value)}
          placeholder="@user-name"
          className="input-field"
        />
        <button className="add-share-button" onClick={handleAddShare}>+</button>
      </div>

      {shareList.length > 0 && (
        <div className="share-list">
          <p>Sharing with:</p>
          {shareList.map((user, i) => (
            <div key={i}>- {user}</div>
          ))}
        </div>
      )}

      <button className="save-button" onClick={encryptMessage}>Save</button>
    </div>
  );
};

export default AddData; 