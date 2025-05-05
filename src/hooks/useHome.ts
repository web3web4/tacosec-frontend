import { useEffect, useState } from "react";
import { GetMyData, getUserProfileDetails } from "../apiService";
import defaultProfileImage from "../assets/images/no-User.png";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { DataItem, TabType, UserProfileDetailsType } from "../types/types";
import Swal from "sweetalert2";

export default function useHome() {
  const navigate = useNavigate();
  const { initDataRaw } = useUser();
  const [data, setData] = useState<DataItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("mydata");


  const handleAddClick = (): void => {
    navigate("/add");
  };

  const handlesetActiveTabClick = (tabActive: TabType): void => {
    setData([]);
    tabActive === "mydata" ? fetchMyData() : fetchSharedData();
    setActiveTab(tabActive);
  };

  const fetchMyData = async () => {
    try {
      const data = await GetMyData(initDataRaw!);
      setData(data);
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
            item.sharedWith.map(async (username) => {
              const profile = await getUserProfileDetails(username);
    
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
    
      setData(enrichedData);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSharedData = async () => {
    // try {
    //   // const data = await GetMyData(initDataRaw!);
    //   const data = [{ key: "test" , value: "test" , id: "123", sharedWith: []}];
    //   setData(data);
    // } catch (err) {
    //   Swal.fire({
    //     icon: "error",
    //     title: "Error",
    //     text: err instanceof Error ? err.message : "An error occurred",
    //   });
    // }
  };

  useEffect(() => {
    fetchMyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, activeTab, handleAddClick, handlesetActiveTabClick };
}
