import useSetting from "../../hooks/useSetting";
import "./Settings.css";

const Settings: React.FC = () => {
  const { profileImage, notificationsOn, handleToggleNotifications } = useSetting();
 

  return (
    <div className="settings-container">
      <h2 className="page-title">Settings</h2>
      <div className="profile-photo-section">
              <div className="photo-preview">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" />
                ) : (
                  <div className="placeholder">No Photo</div>
                )}
              </div>
            </div>
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

      

      <div className="support-section">
        <p>Support and Help</p>
        <button className="support-button">Contact Support</button>
      </div>
    </div>
  );
};

export default Settings; 