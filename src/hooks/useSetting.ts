import { useEffect, useState } from "react";
import { getUserProfileDetails } from "../apiService";
import { useUser } from "../context/UserContext";
import { GetUserProfileDetailsResponse } from "../types/types";

export default function useSetting() {
  const { userData } = useUser();
  const [profileImage, setProfileImage] = useState<string | null>();
  const [notificationsOn, setNotificationsOn] = useState<boolean>(true);
  const [showSupportPopup, setShowSupportPopup] = useState(false);

  const handleToggleNotifications = (): void => {
    setNotificationsOn(!notificationsOn);
    console.log("Notifications toggled:", !notificationsOn);
  };

  const fetchData = async () => {
    const response: GetUserProfileDetailsResponse = await getUserProfileDetails(userData!.username);
    setProfileImage(response && response.img ? response.img.src : null);
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { showSupportPopup, setShowSupportPopup, profileImage, notificationsOn, handleToggleNotifications };
}
