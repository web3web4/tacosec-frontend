import { useEffect, useState } from "react";
import { getUserProfileImage } from "../apiService";
import { useUser } from "../context/UserContext";

export default function useSetting() {
  const { userData } = useUser();
  const [profileImage, setProfileImage] = useState<string | null>();
  const [notificationsOn, setNotificationsOn] = useState<boolean>(true);

  const handleToggleNotifications = (): void => {
    setNotificationsOn(!notificationsOn);
    console.log("Notifications toggled:", !notificationsOn);
  };

  const fetchData = async () => {
    const response: any = await getUserProfileImage(userData!.username);
    setProfileImage(response ? response.src : null);
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { profileImage, notificationsOn, handleToggleNotifications };
}
