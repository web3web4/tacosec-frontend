import { getUserProfileDetails, getAutoCompleteUsername } from "@/services";
import { GetUserProfileDetailsResponse, SearchDataType, UserProfileDetailsType, UserProfileType } from "@/types/types";
import { useCallback, useEffect, useState } from "react";
import { noUserImage, userNotFoundSvg } from "@/assets";
import { useUser, useNavigationGuard } from "@/context";
import { MetroSwal, debounce,createAppError, sanitizeTitle, sanitizePlainText } from "@/utils";
import { utils  } from "ethers";
import { useWallet } from "@/wallet/walletContext";

const initProfileData = {
  img: { src: noUserImage },
  name: "",
  username: "",
  invited: false,
  address: "",
  existsInPlatform: null,
};

export default function useAddData() {
  const { initDataRaw } = useUser();
  const { setNavigationCheck } = useNavigationGuard();
  const [userProfile, setUserProfile] = useState<UserProfileType>({ data: initProfileData, error: null });
  const [searchData, setSearchData] = useState<SearchDataType[]>([]);
  const [shareList, setShareList] = useState<UserProfileType[]>([]);
  const [isOpenPopup, setIsOpenPopup] = useState<boolean>(false);
  const [isSearch, setIsSearch] = useState<boolean>(false);
  const [shareWith, setShareWith] = useState<string>("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState<string>("");
  const { address } = useWallet();

  useEffect(() => {
    setNavigationCheck(() => {
      return (
        shareWith.trim() !== "" || message.trim() !== "" || name.trim() !== ""
      );
    });

  }, [shareWith, message, name]);

  const fetchUserProfile = async (username: string) => {
    // Sanitize incoming username before using
    const safeUsername = sanitizePlainText(username, { maxLength: 64 });
    const cleanedUsername = safeUsername.startsWith("@")
      ? safeUsername.substring(1)
      : safeUsername;

    setUserProfile({ data: initProfileData, error: safeUsername });

    try {
      const response: GetUserProfileDetailsResponse =
        await getUserProfileDetails(cleanedUsername);

      if (!response) {
        const profile = {
          img: { src: userNotFoundSvg },
          name: "",
          username: "",
          address: "",
          invited: false,
          existsInPlatform: false,
        };
        setUserProfile(() => ({ data: profile, error: `No Telegram user found for @${safeUsername}` }));
        return;
      }
      setUserProfile({
        data: {
          img: { src: response.img ? response.img.src : noUserImage },
          name: response.name,
          username: response.username,
          publicAddress: response.publicAddress,
          invited: false,
          existsInPlatform: response.existsInPlatform,
        },
        error: null,
      });
    } catch (error) {
      const appError = createAppError(error, 'network', 'Failed to fetch user profile');
      setUserProfile({ data: initProfileData, error: appError.message });
    }
  };

  const handleConfirmClick = (data: UserProfileDetailsType): void => {
    const isAlreadyInList = shareList.some(
      (user) => user.data.publicAddress?.toLowerCase() === data.publicAddress?.toLowerCase()
    );
    
    if (!isAlreadyInList) {
        const updatedProfile = {
          ...userProfile,
          data: {
            ...userProfile.data,
            address: data.publicAddress,
            invited: false,
          },
        };
        setShareList([...shareList, updatedProfile]);
    }
    
    setIsOpenPopup(false);
    setShareWith("");
    setSearchData([]);
  };

  const handleSearch = async (username: string) => {
    setSearchData([]);
    const sanitized = sanitizePlainText(username, { maxLength: 64 });
    setShareWith(sanitized);
    getUsersAutoComplete(sanitized);
  };

  const closePopup = () => {
    setIsOpenPopup(false);
    setSearchData([]);
  };

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
        if(response[0].username === "User has no Telegram account currently") return;
        setSearchData(response);
      }catch(error){
        console.log(error);
      }finally{
        setIsSearch(false);
      }
    }, 500),
    []
  );

  const handleDeleteUser = (address: string) => {
    setShareList((prevList) => prevList.filter((user) => user.data.publicAddress !== address));
  };

const handleSearchSelect = (user: SearchDataType) => {
  setShareWith(user.username);
  handleAddShare(user.username);
  setSearchData([]);
};


const handleAddShare = (input: string): void => {
  const sanitizedInput = sanitizePlainText(input, { maxLength: 128 });
  if (!sanitizedInput.trim()) return;

  if (utils.isAddress(sanitizedInput)) {
    const isAlreadyInList = shareList.some((user) => user.data.publicAddress?.toLowerCase() === sanitizedInput.toLowerCase());
    const isSameWalletAddress  = sanitizedInput.toLowerCase() === address?.toLowerCase();
    
    if (!isAlreadyInList && !isSameWalletAddress ) {
        const newProfile = {
          data: {
            img: { src: noUserImage },
            name: "",
            username: "",   
            publicAddress: sanitizedInput,
            invited: true,  
            existsInPlatform: false,
          },
          error: null,
        };
        setShareList((prev) => [...prev, newProfile]);
     }
    
    setShareWith("");
    setSearchData([]);
    return;
  }

  setIsOpenPopup(true);
  fetchUserProfile(sanitizedInput);
  setSearchData([]);
};


  const cleanFields = () => {
    setUserProfile({ data: initProfileData, error: null });
    setIsOpenPopup(false);
    setShareWith("");
    setShareList([]);
    setMessage("");
    setName("");
  };
  

  const checkEncrypting = () => {
    if (shareWith.trim() !== "") {
      MetroSwal.warning(
        "Pending Share Action",
        "You entered a username to share with, but didn't click the '+' button. Please share or clear the field before saving."
      );
      return false;
    }

    const safeName = sanitizeTitle(name);
    const safeMessage = sanitizePlainText(message, { maxLength: 5000, preserveNewlines: true });

    if (!safeName.trim()) {
      MetroSwal.fire({
        icon: "warning",
        title: "Warning",
        text: "The Title Field Is Required. Please Enter The Title.",
      });
      return false;
    }
    if (!safeMessage.trim()) {
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
    setIsOpenPopup,
    handleSearch,
    handleAddShare,
    handleConfirmClick,
    handleSearchSelect,
    handleDeleteUser,
    cleanFields,
    checkEncrypting,
    setMessage,
    closePopup,
    setName,
  };
}