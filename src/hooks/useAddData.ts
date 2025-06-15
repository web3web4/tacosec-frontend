import { useEffect, useState } from "react";
import defaultProfileImage from "../assets/images/no-User.png";
import { GetUserProfileDetailsResponse, SearchDataType, UserProfileType } from "../types/types";
import { checkIfUserAvailable, getUserProfileDetails, getAutoCompleteUsername } from "../apiService";
import { useUser } from "../context/UserContext";
import Swal from "sweetalert2";
import { useNavigationGuard } from "../context/NavigationGuardContext";

const initProfileData = {img: { src: defaultProfileImage}, name: "", username: "", invited: false};

export default function useAddData() {
  const { initDataRaw } = useUser();
  const { setNavigationCheck } = useNavigationGuard();
  const [userProfile, setUserProfile] = useState<UserProfileType>({data: initProfileData, error: null});
  const [searchData, setSearchData] = useState<SearchDataType[]>([]);
  const [shareList, setShareList] = useState<UserProfileType[]>([]);
  const [isOpenPopup, setIsOpenPopup] = useState<boolean>(false);
  const [isCanInvite, setIsCanInvite] = useState<boolean>(false);
  const [shareWith, setShareWith] = useState<string>("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState<string>("");
  
  useEffect(() => {
    setNavigationCheck(() => {
      return shareWith.trim() !== "" || message.trim() !== "" || name.trim() !== "";
    });
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareWith, message, name]);

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

  const handleSearch = async (username: string) => {
    setSearchData([]);
    setShareWith(username);
    if(!username) return;
    const response = await getAutoCompleteUsername(initDataRaw!, username);
    setSearchData(response);
  };

  const handleSearchSelect = (username: string) => {
    setShareWith(username);
    setSearchData([]);
  };

  const handleAddShare = (): void => {
    if (!shareWith.trim()) return;
    setIsOpenPopup(true);
    checkIfUserExists();
    fetchUserProfile();
  };

  const clraeFilds = () => {
    setUserProfile({data: initProfileData, error: null});
    setIsOpenPopup(false);
    setIsCanInvite(false);
    setShareWith("");
    setShareList([]);
    setMessage("");
    setName("");
  };

  const checkEncrypting = () => {
    if(shareWith.trim() !== "") {
      Swal.fire({
        icon: "warning",
        title: "Pending Share Action",
        text: "You entered a username to share with, but didn’t click the '+' button. Please share or clear the field before saving.",
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
    message,
    name,
    handleInvite,
    setIsOpenPopup,
    handleSearch,
    handleAddShare,
    handleConfirmClick,
    handleSearchSelect,
    clraeFilds,
    checkEncrypting,
    setMessage,
    setName,
  };
}
