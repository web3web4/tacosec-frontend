import { useState } from "react";
import defaultProfileImage from "../assets/images/no-User.png";
import { UserProfileType } from "../types/types";
import { getUserProfile } from "../apiService";

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
      const response: any = await getUserProfile(username);
      // Check if the response contains this class, the user does not exist
      const tgDownloadLink = response.includes("tl_main_download_link tl_main_download_link_ios");
      // Also Check if the response contains this class, the user does not exist
      const tgIconUser = response.includes("tgme_icon_user");
      if (tgDownloadLink || tgIconUser) {
        setUserProfile((prevInput) => ({
          image: prevInput?.image ?? "",
          error: `No Telegram user found for @${username}`,
        }));
        return;
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(response, "text/html");
      const img: any = doc.querySelector(".tgme_page_photo_image");
      setUserProfile({
        image: img ? img.src : defaultProfileImage,
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
