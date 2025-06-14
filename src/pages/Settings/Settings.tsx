import useSetting from "../../hooks/useSetting";
import defaultProfileImage from "../../assets/images/no-User.png";
import "./Settings.css";
import { useUser } from "../../context/UserContext";
import { useWallet } from "../../wallet/walletContext";

const Settings: React.FC = () => {
  const { profileImage, notificationsOn, handleToggleNotifications } = useSetting();
  const { userData } = useUser();
  const {address} = useWallet();

  return (
    <div className="settings-container">
      <h2 className="page-title">Settings</h2>
      <div className="profile-section">
        <div className="photo-preview">
          <img
            src={profileImage || defaultProfileImage}
            alt="Profile"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = defaultProfileImage;
            }}
          />
        </div>
        <div className="profile-name">{ userData?.firstName } { " " } {userData?.lastName}</div>
        <div className="profile-name">Address Wallet : { " " } {address}</div>

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
