import { useState } from "react";
import defaultProfileImage from "../assets/images/no-User.png";
import { GetUserProfileDetailsResponse, UserProfileType } from "../types/types";
import { getUserProfileDetails } from "../apiService";

const initProfileData = {img: { src: defaultProfileImage}, name: "", username: ""};

export default function useAddData() {
  const [userProfile, setUserProfile] = useState<UserProfileType>({data: initProfileData, error: null});
  const [isOpenPopup, setIsOpenPopup] = useState<boolean>(false);
  const [shareList, setShareList] = useState<UserProfileType[]>([]);
  const [shareWith, setShareWith] = useState<string>("");

  const fetchUserProfile = async () => {
    setUserProfile({ data: initProfileData, error: shareWith });
    const username = shareWith.startsWith("@")
      ? shareWith.substring(1)
      : shareWith;

    try {
      const response: GetUserProfileDetailsResponse = await getUserProfileDetails(username);
      
      if (!response) {
        setUserProfile(() => ({
          data: initProfileData,
          error: `No Telegram user found for @${username}`,
        }));
        return;
      }
      setUserProfile({
        data: {img: { src: response.img ? response.img.src : defaultProfileImage}, name: response.name, username: response.username},
        error: null,
      });
    } catch (error) {
      setUserProfile({
        data: initProfileData,
        error: `Error On Fetch User: ${error}`,
      });
    }
  };

  const handleConfirmClick = (): void => {
    setShareList([...shareList, userProfile]);
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
