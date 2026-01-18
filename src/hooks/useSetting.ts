import { GetUserProfileDetailsResponse, initDataType, AddInformationUser } from "@/types/types";
import { getUserProfileDetails, setPrivacyMode, addInformationUser } from "@/services";
import { useEffect, useState } from "react";
import { useUser } from "@/context";
import { MetroSwal, handleSilentError } from "@/utils";
import Swal from "sweetalert2";

export default function useSetting() {
  const { userData, initDataRaw, setUserData, getUserData } = useUser();
  const [profileImage, setProfileImage] = useState<string | null>();
  const [privacyModOn, setPrivacyModOn] = useState<boolean>(userData?.user?.privacyMode || false);
  const [privacyUpdateStatus, setPrivacyUpdateStatus] = useState<'updating' | 'success' | null>(null);
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [firstName, setFirstName] = useState<string>(userData?.user?.firstName || "");
  const [lastName, setLastName] = useState<string>(userData?.user?.lastName || "");
  const [isSavingUserInfo, setIsSavingUserInfo] = useState<boolean>(false);
  
  // Track initial values for navigation guard
  const [initialUserInfo, setInitialUserInfo] = useState({
    email: "",
    phone: "",
    firstName: userData?.user?.firstName || "",
    lastName: userData?.user?.lastName || "",
  });

  const handleTogglePrivacyMod = async (): Promise<void> => {
    const previousStatus = privacyModOn;
    try {
      const newStatus = !privacyModOn;
      setPrivacyModOn(newStatus);
      setPrivacyUpdateStatus('updating');

      // Show message only if enabling and not hidden before
      if (newStatus && !localStorage.getItem("hidePrivacyModeMessage")) {
        MetroSwal.fire({
          title: "Max Privacy Mode Activated",
          html: `
            <div style="text-align: left; line-height: 1.6;">
              <p style="margin-bottom: 12px; color: #cfcfcfff;">Max Privacy is on. Effects:</p>
              <ul style="list-style: none; padding-left: 0; margin: 0;">
                <li style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--metro-green)" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <span><strong>Anonymity</strong> &mdash; Activity is hidden</span>
                </li>
                <li style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--metro-green)" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                  <span><strong>No metadata</strong> &mdash; Timestamps and views hidden</span>
                </li>
                <li style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--metro-green)" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                  <span><strong>Minimal footprint</strong> &mdash; Secret views leave no trace</span>
                </li>
                <li style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--metro-green)" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 18.69L7.84 6.14 5.27 3.49 4 4.76l2.8 2.8v.01c-.52.99-.8 2.16-.8 3.42v5l-2 2v1h13.73l2 2L21 19.72l-1-1.03zM12 22c1.11 0 2-.89 2-2h-4c0 1.11.89 2 2 2zm6-7.32V11c0-3.08-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68c-.15.03-.29.08-.42.12-.1.03-.2.07-.3.11h-.01c-.01 0-.01 0-.02.01-.23.09-.46.2-.68.31 0 0-.01 0-.01.01z"/>
                  </svg>
                  <span><strong>Generic alerts</strong> &mdash; Notifications say: <em>"Please check your data"</em></span>
                </li>
              </ul>
              <p style="color: #cfcfcfff;">You won't see others' views or reply times.</p>
              <p style="color: #cfcfcfff;">Change this anytime in Settings.</p>
            </div>
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
      
      await setPrivacyMode(initDataRaw!, newStatus);
      if(!userData) {
        await getUserData();
      }
      setUserData((prev: initDataType | null) => {
        if (!prev) return prev;
        return {
          ...prev,
          user: {
            ...prev.user,
            privacyMode: newStatus,
          },
        };
      });
      
      // Show success feedback
      setPrivacyUpdateStatus('success');
      setTimeout(() => setPrivacyUpdateStatus(null), 2000);
    } catch (error) {
      // Revert to previous state on error
      setPrivacyModOn(previousStatus);
      setUserData((prev: initDataType | null) => {
        if (!prev) return prev;
        return {
          ...prev,
          user: {
            ...prev.user,
            privacyMode: previousStatus,
          },
        };
      });
      setPrivacyUpdateStatus(null);
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
      await addInformationUser(payload);
  
      await getUserData();
      
      // Update initial values after successful save
      setInitialUserInfo({
        email: email.trim(),
        phone: phone.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
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
  }, []);

  return {
    showSupportPopup,
    isSavingUserInfo,
    profileImage,
    privacyModOn,
    privacyUpdateStatus,
    firstName,
    lastName,
    email,
    phone,
    initialUserInfo,
    handleTogglePrivacyMod,
    setShowSupportPopup,
    setFirstName,
    saveUserInfo,
    setLastName,
    setEmail,
    setPhone,
  };
}
