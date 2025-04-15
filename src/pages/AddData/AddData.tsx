import React, { useState } from "react";
import "./AddData.css";
import CustomPopup from "../../components/CustomPopup/CustomPopup";
import defaultImage from "../../assets/images/no-User.png";

type DataType = "text" | "number" | "password";

const AddData: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [type, setType] = useState<DataType>("text");
  const [shareWith, setShareWith] = useState<string>("");
  const [shareList, setShareList] = useState<string[]>([]);
  const [isOpenPopup, setIsOpenPopup] = useState<boolean>(false);


  const handleAddShare = (): void => {
    if (!shareWith.trim()) return;
    setIsOpenPopup(true);
  };

  const handleConfirmClick = (): void => {
    setShareList([...shareList, shareWith]);
    setIsOpenPopup(false);
    setShareWith("");
  };

  const handleSave = (): void => {
    console.log({
      name,
      description,
      type,
      sharedWith: shareList,
    });
    alert("Data saved (console.log)!");
  };

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

      <button className="save-button" onClick={handleSave}>Save</button>
    </div>
  );
};

export default AddData; 