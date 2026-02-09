import { useState } from 'react';
import { getUserProfileDetails, GetMyData, getDataSharedWithMy } from '@/services';
import { DataItem, SharedWithMyDataType, TabType, UserProfileDetailsType, Secret } from '@/types/types';
import { createAppError, handleSilentError, showError } from '@/utils';
import { useUser } from '@/context';
import { noUserImage } from '@/assets';

export default function useSecretData() {
  const [myData, setMyData] = useState<DataItem[]>([]);
  const [sharedWithMyData, setSharedWithMyData] = useState<SharedWithMyDataType[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("mydata");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const { initDataRaw } = useUser();

  const fetchMyData = async () => {
    try {
      // Pass initDataRaw which might be null for web login
      setIsLoading(true);
      const response: Secret[] = await GetMyData(initDataRaw || undefined);
      setMyData(response);
      if (response.length > 0) getProfilesDetailsForUsers(response);
      setAuthError(null); // Clear any previous auth errors on success
    } catch (err) {
      const appError = createAppError(err, 'unknown');

      // Handle authentication errors specifically
      if (appError.type === 'auth' || appError.message.includes("Authentication")) {
        setAuthError(appError.message);
        // Only show error alert if we're not in Telegram
        if (!window.Telegram?.WebApp) {
          showError(appError, "Authentication Error");
        }
      } else {
        handleSilentError(appError, "Failed to Load Data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getProfilesDetailsForUsers = async (data: DataItem[]) => {
    try {
      const enrichedData = await Promise.all(
        data.map(async (item) => {
          const userDetails = await Promise.all(
            item.sharedWith.map(async (user) => {
              if (!user.username) {
                return {
                  img: { src: noUserImage },
                  publicAddress: user.publicAddress,
                }
              }
              const profile = await getUserProfileDetails(user.username);

              if (profile && (!profile.img || !profile.img.src || profile.img.src.trim() === "")) {
                return {
                  ...profile,
                  img: { src: noUserImage },
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
      
      setMyData((prev) => 
        prev.map((originalItem) => {
          const enrichedItem = enrichedData.find((e) => e._id === originalItem._id);
          return enrichedItem ? { ...originalItem, shareWithDetails: enrichedItem.shareWithDetails } : originalItem;
        })
      );
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSharedWithMyData = async () => {
    try {
      setIsLoading(true);
      const response = await getDataSharedWithMy(initDataRaw || undefined);
      setSharedWithMyData(response.data);
      if (response.data.length > 0) getProfilesDetailsForUsersSharedBy(response.data);
      setAuthError(null); // Clear any previous auth errors on success
    } catch (err) {
      const appError = createAppError(err, 'unknown');

      if (appError.message.includes("Authentication")) {
        setAuthError(appError.message);
        // Only show error alert for non-authentication errors or if we're not in Telegram
        if (!window.Telegram?.WebApp) {
          showError(appError, "Authentication Error");
        }
      } else {
        handleSilentError(appError, "Failed to Load Shared Data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getProfilesDetailsForUsersSharedBy = async (data: SharedWithMyDataType[]) => {
    const enrichedData = await Promise.all(
      data.map(async (item) => {
        const profile = await getUserProfileDetails(item.sharedBy.username);

        if (!profile) {
          const enhancedSharedBy = {
            ...item.sharedBy,
            img: { src: noUserImage },
            name: ""
          };

          return {
            ...item,
            sharedBy: enhancedSharedBy,
          };
        }

        const profileWithDefaultImg = {
          ...profile,
          img: (profile.img && profile.img.src && profile.img.src.trim() !== "") 
            ? profile.img 
            : { src: noUserImage },
        };

        const enhancedSharedBy = {
          ...item.sharedBy,
          img: profileWithDefaultImg.img,
          name: profileWithDefaultImg.name
        };

        return {
          ...item,
          sharedBy: enhancedSharedBy,
        };
      })
    );
    
    setSharedWithMyData((prev) => 
      prev.map((originalItem) => {
        const enrichedItem = enrichedData.find((e) => e._id === originalItem._id);
        return enrichedItem ? { ...originalItem, sharedBy: enrichedItem.sharedBy } : originalItem;
      })
    );
  };

  const handleSetActiveTab = (tabActive: TabType): void => {
    setMyData([]);
    tabActive === "mydata" ? fetchMyData() : fetchSharedWithMyData();
    setActiveTab(tabActive);
  };

  return {
    myData,
    setMyData,
    sharedWithMyData,
    setSharedWithMyData,
    activeTab,
    setActiveTab,
    isLoading,
    authError,
    fetchMyData,
    fetchSharedWithMyData,
    handleSetActiveTab,
  };
}
