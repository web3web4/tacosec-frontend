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
                <li style="margin-bottom: 8px;"><span style="color: var(--metro-green); font-weight: bold;">●</span> <strong>Anonymity</strong> &mdash; Activity is hidden</li>
                <li style="margin-bottom: 8px;"><span style="color: var(--metro-green); font-weight: bold;">●</span> <strong>No metadata</strong> &mdash; Timestamps and views hidden</li>
                <li style="margin-bottom: 8px;"><span style="color: var(--metro-green); font-weight: bold;">●</span> <strong>Minimal footprint</strong> &mdash; Secret views leave no trace</li>
                <li style="margin-bottom: 8px;"><span style="color: var(--metro-green); font-weight: bold;">●</span> <strong>Generic alerts</strong> &mdash; Notifications say: <em>"Please check your data"</em></li>
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
