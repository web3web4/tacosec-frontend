import React, { useState } from "react";
import CustomPopup from "../../components/CustomPopup/CustomPopup";
import defaultProfileImage from "../../assets/images/no-User.png";
import avilableIcon from "../../assets/icons/accept.png";
import useTaco from "../../hooks/useTaco";
import { useWallet } from "../../wallet/walletContext";
import { conditions, toHexString } from "@nucypher/taco";
import Swal from "sweetalert2";
import { useUser } from "../../context/UserContext";
import { storageEncryptedData } from "../../apiService";
import { parseTelegramInitData } from "../../utils/tools";
import useAddData from "../../hooks/useAddData";
import "./AddData.css";

const ritualId = process.env.REACT_APP_TACO_RITUAL_ID as unknown as number;
const domain = process.env.REACT_APP_TACO_DOMAIN as string;
const BOT_USER_NAME = process.env.REACT_APP_BOT_USER_NAME as string;
const BACKEND = process.env.REACT_APP_API_BASE_URL as string;

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
    handleInvite
  } = useAddData();
  const [message, setMessage] = useState("");
  const [name, setName] = useState<string>("");
  const [encrypting, setEncrypting] = useState(false);
  const { provider, signer } = useWallet();
  const { initDataRaw, userData } = useUser();

  const { isInit, encryptDataToBytes } = useTaco({
    domain,
    provider,
    ritualId,
  });

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

      let usernames: string = "";
      usernames = userData?.username.toLowerCase()!;
      shareList
        .filter((item) => item.data.username !== null)
        .map((item) => (
          usernames += "," + item.data.username!.toLowerCase()
        ));

      //condition
      const checkUsersCondition = new conditions.base.jsonApi.JsonApiCondition({
        endpoint: `${BACKEND}/telegram/verify-test`,
        parameters: {
          TelegramUsernames : usernames,
          authorizationToken: ":authorizationToken"
        },
        query: '$.isValid',
        returnValueTest: { comparator: '==', value: true },
      });

      console.log("Encrypting message...");
      const encryptedBytes = await encryptDataToBytes(
        message,
        checkUsersCondition,
        signer!
      );

      if (encryptedBytes) {
        const encryptedHex = toHexString(encryptedBytes);
        const parsedInitData = parseTelegramInitData(initDataRaw!);
        const sharedWithList: { username: string; invited: boolean }[] = shareList
          .filter((item) => item.data.username !== null)
          .map((item) => ({
            username: item.data.username!,
            invited: item.data.invited ?? false,
          }));

        const res = await storageEncryptedData(
          {
            key: name,
            description: "",
            type: "text",
            value: encryptedHex!,
            sharedWith: sharedWithList,
            initData: parsedInitData,
          },
          initDataRaw!
        );
        if (res) {
          Swal.fire({
            icon: "success",
            title: `The data was successfully encrypted and securely stored`,
            showConfirmButton: false,
            timer: 4000
          });
        }
      }
    } catch (e) {
      console.log(e);
    }
    setEncrypting(false);
  };

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
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = defaultProfileImage;
              }}
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
            <div className="user_container">
            <div key={i}>- {user.data.name}</div>
            { user.data.invited ? 
            (<img src={avilableIcon} alt="avilable icon" width={20} height={20}/>) : 
            (
            <a
            href={`https://t.me/${user.data.username}?text=${encodeURIComponent(`I’ve shared some private files with you. Please open the bot to view them: ${BOT_USER_NAME}`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="btn-invited" onClick={() => {handleInvite(i)}}>invite</button>
          </a>
            )}
            </div>
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
