import React, { useState } from "react";
import "./Settings.css";

function Settings() {
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState(null);

  const handleToggleNotifications = () => {
    setNotificationsOn(!notificationsOn);
    console.log("Notifications toggled:", !notificationsOn);
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(URL.createObjectURL(file));
      console.log("Photo selected:", file.name);
    }
  };

  return (
    <div className="settings-container">
      <h2 className="page-title">Settings</h2>

      <div className="notifications-row">
        <span>Turn on Notifications</span>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={notificationsOn}
            onChange={handleToggleNotifications}
          />
          <span className="slider round"></span>
        </label>
      </div>
      <p className="desc">Enable to receive updates and alerts.</p>

      <div className="profile-photo-section">
        <p>Change Profile Photo</p>
        <div className="photo-preview">
          {profilePhoto ? (
            <img src={profilePhoto} alt="Profile" />
          ) : (
            <div className="placeholder">No Photo</div>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleProfilePhotoChange}
          className="upload-input"
        />
      </div>

      <div className="support-section">
        <p>Support and Help</p>
        <button className="support-button">Contact Support</button>
      </div>
    </div>
  );
}

export default Settings;
