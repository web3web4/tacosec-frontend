import React, { useState } from "react";
import "./AddData.css";

function AddData() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("text");
  const [shareWith, setShareWith] = useState("");
  const [shareList, setShareList] = useState([]);

  const handleAddShare = () => {
    if (!shareWith.trim()) return;
    setShareList([...shareList, shareWith]);
    setShareWith("");
  };

  const handleSave = () => {
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
      <select value={type} onChange={(e) => setType(e.target.value)} className="input-field">
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
}

export default AddData;
