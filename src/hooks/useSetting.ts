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
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [firstName, setFirstName] = useState<string>(userData?.user?.firstName || "");
  const [lastName, setLastName] = useState<string>(userData?.user?.lastName || "");
  const [isSavingUserInfo, setIsSavingUserInfo] = useState<boolean>(false);

  const handleTogglePrivacyMod = async (): Promise<void> => {
    const previousStatus = privacyModOn;
    try {
      const newStatus = !privacyModOn;
      setPrivacyModOn(newStatus);

      // Show message only if enabling and not hidden before
      if (newStatus && !localStorage.getItem("hidePrivacyModeMessage")) {
        MetroSwal.fire({
          title: "Max Privacy Mode Activated",
          html: `
            <div style="text-align: left; line-height: 1.6;">
              <p style="margin-bottom: 16px; color: #555;">You've activated an extra measure of privacy. Here's what changes:</p>
              <ul style="list-style: none; padding-left: 0; margin: 0;">
                <li style="margin-bottom: 10px;">👤 <strong>Mutual anonymity</strong> &mdash; Your activity stays hidden from others, and you won't see theirs either</li>
                <li style="margin-bottom: 10px;">⏱️ <strong>No metadata</strong> &mdash; Reply timestamps and view statuses become unavailable for everyone</li>
                <li style="margin-bottom: 10px;">🔒 <strong>Minimal footprint</strong> &mdash; Your secret views leave no traces</li>
                <li style="margin-bottom: 10px;">🔕 <strong>Generic alerts</strong> &mdash; All notifications display only: <em>"Please check your data"</em></li>
              </ul>
              <p style="color: #666;"><strong>Note:</strong> This creates a privacy shield for everyone &mdash; you'll stay private, but you also won't see if others viewed your secrets or when they replied.</p>
              <p style="color: #666;">Toggle anytime in Settings to adjust your privacy level.</p>
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
    firstName,
    lastName,
    email,
    phone,
    handleTogglePrivacyMod,
    setShowSupportPopup,
    setFirstName,
    saveUserInfo,
    setLastName,
    setEmail,
    setPhone,
  };
}
