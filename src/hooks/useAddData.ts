import { useState } from "react";
import defaultProfileImage from "../assets/images/no-User.png";
import { UserProfileType } from "../types/types";
import { getUserProfileImage } from "../apiService";

export default function useAddData() {
  const [userProfile, setUserProfile] = useState<UserProfileType>({image: defaultProfileImage, error: null});
  const [isOpenPopup, setIsOpenPopup] = useState<boolean>(false);
  const [shareList, setShareList] = useState<string[]>([]);
  const [shareWith, setShareWith] = useState<string>("");

  const fetchUserProfile = async () => {
    setUserProfile({ image: defaultProfileImage, error: shareWith });
    const username = shareWith.startsWith("@")
      ? shareWith.substring(1)
      : shareWith;

    try {
      const response: any = await getUserProfileImage(username);
      
      if (!response) {
        setUserProfile((prevInput) => ({
          image: prevInput?.image ?? "",
          error: `No Telegram user found for @${username}`,
        }));
        return;
      }

      setUserProfile({
        image: response ? response.src : defaultProfileImage,
        error: null,
      });
    } catch (error) {
      setUserProfile({
        image: defaultProfileImage,
        error: `Error On Fetch User: ${error}`,
      });
    }
  };

  const handleConfirmClick = (): void => {
    const username = shareWith.startsWith("@")
      ? shareWith.substring(1)
      : shareWith;
    setShareList([...shareList, username]);
    setIsOpenPopup(false);
    setShareWith("");
  };

  const handleAddShare = (): void => {
    if (!shareWith.trim()) return;
    setIsOpenPopup(true);
    fetchUserProfile();
  };

  return {
    userProfile,
    isOpenPopup,
    shareList,
    shareWith,
    setIsOpenPopup,
    setShareWith,
    handleAddShare,
    handleConfirmClick,
  };
}
