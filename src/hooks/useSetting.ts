import { useEffect, useState } from "react";
import { getUserProfileDetails, setPrivacyMode } from "../apiService";
import { useUser } from "../context/UserContext";
import { GetUserProfileDetailsResponse, initDataType } from "../types/types";

export default function useSetting() {
  const { userData, initDataRaw, setUserData } = useUser();
  const [profileImage, setProfileImage] = useState<string | null>();
  const [notificationsOn, setNotificationsOn] = useState<boolean>(true);
  const [privacyModOn, setPrivacyModOn] = useState<boolean>(userData?.privacyMode || false);
  const [showSupportPopup, setShowSupportPopup] = useState(false);

  const handleToggleNotifications = (): void => {
    setNotificationsOn(!notificationsOn);
    console.log("Notifications toggled:", !notificationsOn);
  };

  const handleTogglePrivacyMod = (): void => {
    try {
      setPrivacyModOn(!privacyModOn);
      setPrivacyMode(initDataRaw!, !privacyModOn);
      setUserData((prev: initDataType | null) => {
        if (!prev) return prev;
        return { ...prev, privacyMode: !privacyModOn };
      });
    } catch (error) {
      console.log("Error On Set Privacy mod:", error);
    }
    
  };

const fetchData = async () => {
  const username = userData?.username;

  if (!username) {
    console.warn("No username found. Skipping profile fetch.");
    return;
  }

  try {
    const response: GetUserProfileDetailsResponse = await getUserProfileDetails(username);
    setProfileImage(response && response.img ? response.img.src : null);
  } catch (error) {
    console.error("Error fetching user profile details:", error);
  }
};


  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { showSupportPopup, setShowSupportPopup, profileImage, notificationsOn, handleTogglePrivacyMod, handleToggleNotifications, privacyModOn };
}
