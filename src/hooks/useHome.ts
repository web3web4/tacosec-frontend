import { useEffect, useState } from "react";
import { GetDataSharedWithMy, GetMyData, getUserProfileDetails } from "../apiService";
import defaultProfileImage from "../assets/images/no-User.png";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { DataItem, SharedWithMyDataType, TabType, UserProfileDetailsType } from "../types/types";
import Swal from "sweetalert2";

export default function useHome() {
  const navigate = useNavigate();
  const { initDataRaw } = useUser();
  const [myData, setMyData] = useState<DataItem[]>([]);
  const [sharedWithMyData, setSharedWithMyData] = useState<SharedWithMyDataType[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("mydata");

  const handleAddClick = (): void => {
    navigate("/add");
  };

  const handlesetActiveTabClick = (tabActive: TabType): void => {
    setMyData([]);
    tabActive === "mydata" ? fetchMyData() : fetchSharedWithMyData();
    setActiveTab(tabActive);
  };

  const fetchMyData = async () => {
    try {
      const data = await GetMyData(initDataRaw!);
      setMyData(data);
      if(data.length > 0) await getProfilesDetailsForUsers(data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err instanceof Error ? err.message : "An error occurred",
      });
    }
  };

  const getProfilesDetailsForUsers = async (data: DataItem[]) => {
    try{
      const enrichedData: DataItem[] = await Promise.all(
        data.map(async (item) => {
          const userDetails = await Promise.all(
            item.sharedWith.map(async (user) => {
              const profile = await getUserProfileDetails(user.username);

              if (profile && (!profile.img || !profile.img.src || profile.img.src.trim() === "")) {
                return {
                  ...profile,
                  img: { src: defaultProfileImage },
                };
              }
  
              return profile;
            })
          );
  
          const filteredDetails = userDetails.filter(
            (profile): profile is UserProfileDetailsType => profile !== null
          );
  
          return {
            ...item,
            shareWithDetails: filteredDetails,
          };
        })
      );

      setMyData(enrichedData);
    } catch (error) {
      console.log(error);
    }
  };
  
  const fetchSharedWithMyData = async () => {
    try {
      const data = await GetDataSharedWithMy(initDataRaw!);
      setSharedWithMyData(data.sharedWithMe);
      if(data.sharedWithMe.length > 0) await getProfilesDetailsForUsersSharedBy(data.sharedWithMe);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err instanceof Error ? err.message : "An error occurred",
      });
    }
  };

  const getProfilesDetailsForUsersSharedBy = async (data: SharedWithMyDataType[]) => {
    const enrichedData = await Promise.all(
      data.map(async (item) => {
        const profile = await getUserProfileDetails(item.username);
        
        if (!profile) return item;
  
        const profileWithDefaultImg = {
          ...profile,
          img: profile.img ?? { src: defaultProfileImage},
        };
  
        return {
          ...item,
          sharedByDetails: profileWithDefaultImg,
        };
      })
    );
    setSharedWithMyData(enrichedData);
  };
  

  useEffect(() => {
    fetchMyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { myData, sharedWithMyData, activeTab, handleAddClick, handlesetActiveTabClick };
}
