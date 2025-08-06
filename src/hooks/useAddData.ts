import { useCallback, useEffect, useState } from "react";
import defaultProfileImage from "../assets/images/no-User.png";
import userNotFoundImage from "../assets/images/user-not-found.svg";
import { GetUserProfileDetailsResponse, SearchDataType, UserProfileType } from "../types/types";
import { checkIfUserAvailable, getUserProfileDetails, getAutoCompleteUsername } from "../apiService";
import { useUser } from "../context/UserContext";
import { MetroMetroSwal } from "../utils/metroMetroSwal";
import { useNavigationGuard } from "../context/NavigationGuardContext";
import { debounce } from "../utils/tools";

const initProfileData = {
  img: { src: defaultProfileImage },
  name: "",
  username: "",
  invited: false,
};

export default function useAddData() {
  const { initDataRaw } = useUser();
  const { setNavigationCheck } = useNavigationGuard();
  const [userProfile, setUserProfile] = useState<UserProfileType>({ data: initProfileData, error: null });
  const [searchData, setSearchData] = useState<SearchDataType[]>([]);
  const [shareList, setShareList] = useState<UserProfileType[]>([]);
  const [isOpenPopup, setIsOpenPopup] = useState<boolean>(false);
  const [isCanInvite, setIsCanInvite] = useState<boolean>(false);
  const [isSearch, setIsSearch] = useState<boolean>(false);
  const [shareWith, setShareWith] = useState<string>("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState<string>("");

  useEffect(() => {
    setNavigationCheck(() => {
      return (
        shareWith.trim() !== "" || message.trim() !== "" || name.trim() !== ""
      );
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareWith, message, name]);

  const fetchUserProfile = async (username: string) => {
    setUserProfile({ data: initProfileData, error: username });
    const cleanedUsername = username.startsWith("@")
      ? username.substring(1)
      : username;

    try {
      const response: GetUserProfileDetailsResponse =
        await getUserProfileDetails(cleanedUsername);

      if (!response) {
        const profile = {
          img: { src: userNotFoundImage },
          name: "",
          username: "",
          invited: false,
        };
        setUserProfile(() => ({ data: profile, error: `No Telegram user found for @${username}` }));
        return;
      }
      setUserProfile({
        data: {
          img: { src: response.img ? response.img.src : defaultProfileImage },
          name: response.name,
          username: response.username,
          invited: false,
        },
        error: null,
      });
    } catch (error) {
      setUserProfile({ data: initProfileData, error: `Error On Fetch User: ${error}` });
    }
  };

  const checkIfUserExists = async (username: string) => {
    try {
      const cleanedUsername = username.startsWith("@")
        ? username.substring(1)
        : username;

      const response = await checkIfUserAvailable(initDataRaw!, cleanedUsername);
      setIsCanInvite(response);
    } catch (error) {
      console.log(error);
    }
  };

  const handleConfirmClick = (): void => {
    const cleanedUsername = shareWith.startsWith("@")
      ? shareWith.substring(1)
      : shareWith;

    const isAlreadyInList = shareList.some(
      (user) => user.data.username?.toLowerCase() === cleanedUsername.trim().toLowerCase()
    );

    if (!isAlreadyInList) {
        const updatedProfile = {
          ...userProfile,
          data: {
            ...userProfile.data,
            username: cleanedUsername.toLowerCase(),
            invited: isCanInvite,
          },
        };
        setShareList([...shareList, updatedProfile]);
    }
    
    setIsOpenPopup(false);
    setIsCanInvite(false);
    setShareWith("");
    setSearchData([]);
  };

  const handleInvite = (index: number) => {
    setShareList((prevList) =>
      prevList.map((user, i) =>
        i === index ? { ...user, data: { ...user.data, invited: true } } : user
      )
    );
  };

  const handleSearch = async (username: string) => {
    setSearchData([]);
    setShareWith(username);
    getUsersAutoComplete(username);
  };

  const closePopup = (value: boolean) => {
    setIsOpenPopup(false);
    setSearchData([]);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getUsersAutoComplete = useCallback(
    debounce(async (username: string) => {
      if (!username) {
        setSearchData([]);
        return;
      }
        setIsSearch(true);
      try{
        const cleanedUsername = username.startsWith("@")
          ? username.substring(1)
          : username;

        const response = await getAutoCompleteUsername(initDataRaw!, cleanedUsername);
        setSearchData(response);
      }catch(error){
        console.log(error);
      }finally{
        setIsSearch(false);
      }
    }, 500),
    []
  );

  const handleDeleteUsername = (username: string) => {
    setShareList((prevList) => prevList.filter((user) => user.data.username !== username));
  };

  const handleSearchSelect = (username: string) => {
    setShareWith(username);
    handleAddShare(username);
    setSearchData([]);
  };

  const handleAddShare = (username: string): void => {
    if (!shareWith.trim()) return;
    setIsOpenPopup(true);
    checkIfUserExists(username);
    fetchUserProfile(username);
    setSearchData([]);
  };

  const cleanFields = () => {
    setUserProfile({ data: initProfileData, error: null });
    setIsOpenPopup(false);
    setIsCanInvite(false);
    setShareWith("");
    setShareList([]);
    setMessage("");
    setName("");
  };

  const checkEncrypting = () => {
    if (shareWith.trim() !== "") {
      MetroMetroSwal.warning(
        "Pending Share Action",
        "You entered a username to share with, but didn't click the '+' button. Please share or clear the field before saving."
      );
      return false;
    }
    if (name.trim() === "") {
      MetroSwal.fire({
        icon: "warning",
        title: "Warning",
        text: "The Title Field Is Required. Please Enter The Title.",
      });
      return false;
    }
    if (message.trim() === "") {
      MetroSwal.fire({
        icon: "warning",
        title: "Warning",
        text: "The Secret Field Is Required. Please Enter The Secret.",
      });
      return false;
    }
    return true;
  };

  return {
    userProfile,
    isOpenPopup,
    searchData,
    shareList,
    shareWith,
    isSearch,
    message,
    name,
    handleInvite,
    setIsOpenPopup,
    handleSearch,
    handleAddShare,
    handleConfirmClick,
    handleSearchSelect,
    handleDeleteUsername,
    cleanFields,
    checkEncrypting,
    setMessage,
    closePopup,
    setName,
  };
}