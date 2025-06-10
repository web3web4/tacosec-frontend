import { useState } from "react";
import defaultProfileImage from "../assets/images/no-User.png";
import { GetUserProfileDetailsResponse, UserProfileType } from "../types/types";
import { checkIfUserAvailable, getUserProfileDetails } from "../apiService";
import { useUser } from "../context/UserContext";

const initProfileData = {img: { src: defaultProfileImage}, name: "", username: "", invited: false};

export default function useAddData() {
  const [userProfile, setUserProfile] = useState<UserProfileType>({data: initProfileData, error: null});
  const [isOpenPopup, setIsOpenPopup] = useState<boolean>(false);
  const [isCanInvite, setIsCanInvite] = useState<boolean>(false);
  const [shareList, setShareList] = useState<UserProfileType[]>([]);
  const [shareWith, setShareWith] = useState<string>("");
  const { initDataRaw } = useUser();

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
        data: {img: { src: response.img ? response.img.src : defaultProfileImage}, name: response.name, username: response.username, invited: false},
        error: null,
      });

    } catch (error) {
      setUserProfile({
        data: initProfileData,
        error: `Error On Fetch User: ${error}`,
      });
    }
  };

  const checkIfUserExists = async () => {
    try {
      const username = shareWith.startsWith("@")
      ? shareWith.substring(1)
      : shareWith;

      const response = await checkIfUserAvailable(initDataRaw!, username);
      setIsCanInvite(response);
    } catch (error) {
      console.log(error);
    }
  };

  const handleConfirmClick = (): void => {
    const cleanedUsername = shareWith.startsWith("@")
      ? shareWith.substring(1)
      : shareWith;
  
    const updatedProfile = {
      ...userProfile,
      data: {
        ...userProfile.data,
        username: cleanedUsername.toLowerCase(),
        invited: isCanInvite
      }
    };
  
    setShareList([...shareList, updatedProfile]);
    setIsOpenPopup(false);
    setIsCanInvite(false);
    setShareWith("");
  };
  

  const handleInvite = (index: number) => {
    setShareList((prevList) =>
      prevList.map((user, i) =>
        i === index
          ? { ...user, data: { ...user.data, invited: true } }
          : user
      )
    );
  };

  const handleAddShare = (): void => {
    if (!shareWith.trim()) return;
    setIsOpenPopup(true);
    checkIfUserExists();
    fetchUserProfile();
  };

  return {
    userProfile,
    isOpenPopup,
    shareList,
    shareWith,
    handleInvite,
    setIsOpenPopup,
    setShareWith,
    handleAddShare,
    handleConfirmClick,
  };
}
