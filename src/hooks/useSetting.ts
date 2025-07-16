import { useEffect, useState } from "react";
import { getUserProfileDetails } from "../apiService";
import { useUser } from "../context/UserContext";
import { GetUserProfileDetailsResponse, initDataType } from "../types/types";

export default function useSetting() {
  const { userData }: { userData: initDataType | null } = useUser();
  const [profileImage, setProfileImage] = useState<string | null>();
  const [notificationsOn, setNotificationsOn] = useState<boolean>(true);
  const [showSupportPopup, setShowSupportPopup] = useState(false);

  const handleToggleNotifications = (): void => {
    setNotificationsOn(!notificationsOn);
    console.log("Notifications toggled:", !notificationsOn);
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

  return { showSupportPopup, setShowSupportPopup, profileImage, notificationsOn, handleToggleNotifications };
}
