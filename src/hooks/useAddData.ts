import { getUserProfileDetails, getAutoCompleteUsername } from "@/apiService";
import { GetUserProfileDetailsResponse, SearchDataType, UserProfileDetailsType, UserProfileType } from "@/types/types";
import { useCallback, useEffect, useState } from "react";
import { noUserImage, userNotFoundSvg } from "@/assets";
import { useUser, useNavigationGuard } from "@/context";
import { MetroSwal, debounce,createAppError } from "@/utils";
import { utils  } from "ethers";

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
          img: { src: userNotFoundSvg },
          name: "",
          username: "",
          address: "",
          invited: false,
          existsInPlatform: false,
        };
        setUserProfile(() => ({ data: profile, error: `No Telegram user found for @${username}` }));
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
      (user) => user.data.publicAddress?.toLocaleLowerCase() === data.publicAddress?.toLocaleLowerCase()
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
    setShareWith(username);
    getUsersAutoComplete(username);
  };

  const closePopup = () => {
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

  const handleDeleteUser = (address: string) => {
    setShareList((prevList) => prevList.filter((user) => user.data.publicAddress !== address));
  };

const handleSearchSelect = (user: SearchDataType) => {
  setShareWith(user.username);
  handleAddShare(user.username);
  setSearchData([]);
};


const handleAddShare = (input: string): void => {
  if (!input.trim()) return;

  if (utils.isAddress(input)) {
    const isAlreadyInList = shareList.some((user) => user.data.publicAddress?.toLocaleLowerCase() === input.toLocaleLowerCase());
    if(!isAlreadyInList){
        const newProfile = {
          data: {
            img: { src: noUserImage },
            name: "",
            username: "",   
            publicAddress: input,
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
  fetchUserProfile(input);
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