import { GetUserProfileDetailsResponse, initDataType, AddInformationUser } from "@/types/types";
import { getUserProfileDetails, setPrivacyMode, addInformationUser } from "@/apiService";
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

  // New: user info fields state
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [firstName, setFirstName] = useState<string>(userData?.user?.firstName || "");
  const [lastName, setLastName] = useState<string>(userData?.user?.lastName || "");
  const [isSavingUserInfo, setIsSavingUserInfo] = useState<boolean>(false);

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
          title: "Max Privacy Mode Activated",
          html: `
            <p>With Max Privacy Mode enabled:</p>
            <ul style="text-align:left; margin-left:25px">
              <li>Viewing any secret will not be tracked or recorded.</li>
              <li>Your own secret views will remain anonymous; others cannot see if you've viewed theirs.</li>
              <li>Reply timestamps and details about shared secrets are hidden from all users.</li>
              <li>Notifications will only display: <em>"Please check your data."</em></li>
              <li>No metadata or activity logs are saved during this mode.</li>
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

  // New: save user info implementation
  const saveUserInfo = async (): Promise<void> => {
    try {
      setIsSavingUserInfo(true);
      const payload: AddInformationUser = {
        email: email.trim(),
        phone: phone.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      };
      const res = await addInformationUser(payload);
  
      // reflect name updates locally if available
      setUserData((prev: initDataType | null) => {
        if (!prev) return prev;
        return {
          ...prev,
          user: {
            ...prev.user,
            email: payload.email,
            phone: payload.phone,
            firstName: payload.firstName,
            lastName: payload.lastName,
          },
        };
      });
  
      await MetroSwal.fire({
        icon: "success",
        title: "Saved",
        text: "Your information has been updated.",
      });
    } catch (error) {
      handleSilentError(error, "updating user info");
      await MetroSwal.fire({
        icon: "error",
        title: "Update failed",
        text: "We couldn't update your info. Please try again.",
      });
    } finally {
      setIsSavingUserInfo(false);
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

  return {
    showSupportPopup,
    setShowSupportPopup,
    profileImage,
    notificationsOn,
    handleTogglePrivacyMod,
    handleToggleNotifications,
    privacyModOn,
    email,
    setEmail,
    phone,
    setPhone,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    saveUserInfo,
    isSavingUserInfo,
  };
}
