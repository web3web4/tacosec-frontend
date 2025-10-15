import { GetUserProfileDetailsResponse, initDataType } from "@/types/types";
import { getUserProfileDetails, setPrivacyMode } from "@/apiService";
import { useEffect, useState } from "react";
import { useUser } from "@/context";
import { MetroSwal, handleSilentError } from "@/utils";
import Swal from "sweetalert2";

export default function useSetting() {
  const { userData, initDataRaw, setUserData } = useUser();
  const [profileImage, setProfileImage] = useState<string | null>();
  const [notificationsOn, setNotificationsOn] = useState<boolean>(true);
  const [privacyModOn, setPrivacyModOn] = useState<boolean>(userData?.user?.privacyMode || false);
  const [showSupportPopup, setShowSupportPopup] = useState(false);

  const handleToggleNotifications = (): void => {
    setNotificationsOn(!notificationsOn);
    console.log("Notifications toggled:", !notificationsOn);
  };

const handleTogglePrivacyMod = (): void => {
  try {
    const newStatus = !privacyModOn;
    setPrivacyModOn(newStatus);
    setPrivacyMode(initDataRaw!, newStatus);
    setUserData((prev: initDataType | null) => {
      if (!prev) return prev;
      return { ...prev, privacyMode: newStatus };
    });

    // Show message only if enabling and not hidden before
    if (newStatus && !localStorage.getItem("hidePrivacyModeMessage")) {
      MetroSwal.fire({
        title: "Privacy Mode Activated",
        html: `
          <p>When Privacy Mode is enabled:</p>
          <ul style="text-align:left; margin-left:25px">
            <li>Viewing a secret will not be recorded.</li>
            <li>Views on your secrets will not be tracked.</li>
            <li>Reply dates and shared secret details will be hidden.</li>
            <li>Notifications will only say: <em>"Please check your data"</em>.</li>
          </ul>
        `,
        showCancelButton: true,
        confirmButtonText: "Got it",
        cancelButtonText: "Don't show again",
      }).then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
          localStorage.setItem("hidePrivacyModeMessage", "true");
        }
      });
    }
  } catch (error) {
    handleSilentError(error, 'setting privacy mode');
  }
};


const fetchData = async () => {
  const username = userData?.user?.username;

  if (!username) {
    console.warn("No username found. Skipping profile fetch.");
    return;
  }

  try {
    const response: GetUserProfileDetailsResponse = await getUserProfileDetails(username);
    setProfileImage(response && response.img ? response.img.src : null);
  } catch (error) {
    handleSilentError(error, 'fetching user profile details');
  }
};


  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { showSupportPopup, setShowSupportPopup, profileImage, notificationsOn, handleTogglePrivacyMod, handleToggleNotifications, privacyModOn };
}
