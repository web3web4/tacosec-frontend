import { getDataSharedWithMy, getUserProfileDetails, hidePassword, deletePassword, GetMyData, getChildrenForSecret, setSecretView, getSecretViews } from "@/apiService";
import { DataItem, SharedWithMyDataType, TabType, UserProfileDetailsType, SecretViews, ViewDetails, Secret, initDataType } from "@/types/types";
import { MetroSwal, formatDate, showError, createAppError, handleSilentError , config } from "@/utils";
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWallet } from "@/wallet/walletContext";
import { fromHexString } from "@nucypher/shared";
import { SweetAlertOptions } from "sweetalert2";
import { fromBytes } from "@nucypher/taco";
import { noUserImage } from "@/assets";
import { useUser } from "@/context";
import { useTaco } from "@/hooks";
import { ethers } from "ethers";

const ritualId = config.TACO_RITUAL_ID;
const domain = config.TACO_DOMAIN;

interface HomeContextType {
  myData: DataItem[];
  sharedWithMyData: SharedWithMyDataType[];
  setSharedWithMyData: React.Dispatch<React.SetStateAction<SharedWithMyDataType[]>>;
  activeTab: TabType;
  isLoading: boolean;
  userData: initDataType | null;
  initDataRaw: string | null;
  handleAddClick: () => void;
  handleSetActiveTabClick: (tabActive: TabType) => void;
  handleDelete: (id: string, isHasSharedWith: boolean) => Promise<void>;
  triggerGetChildrenForSecret: (id: string) => void;
  handleDirectLink: () => void;
  handleDirectLinkForChildren: () => void;
  handleGetSecretViews: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, secretId: string) => void; 
  setShowViewersPopup: Dispatch<SetStateAction<boolean>>;
  showViewersPopup: boolean;
  currentSecretViews: SecretViews | null;
  isInit: boolean;
  provider: ethers.providers.Provider | undefined;
  decrypting: boolean;
  decryptedMessages: Record<string, string>;
  decryptErrors: Record<string, string>;
  toggleExpand: (value: string, id: string) => Promise<void>;
  expandedId: string | null;
  toggleChildExpand: (value: string, childId: string) => void;
  expandedChildId: string | null;
  decryptingChild: boolean;
  decryptedChildMessages: Record<string, string>;
  authError: string | null;
  secretViews: Record<string, SecretViews>;
  itemRefs: React.RefObject<{ [key: string]: HTMLDivElement | null }>;
}

const HomeContext = createContext<HomeContextType | null>(null);

export function HomeProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [myData, setMyData] = useState<DataItem[]>([]);
  const [sharedWithMyData, setSharedWithMyData] = useState<SharedWithMyDataType[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("mydata");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [decryptedMessages, setDecryptedMessages] = useState<Record<string, string>>({});
  const [decryptErrors, setDecryptErrors] = useState<{ [id: string]: string }>({});
  const [decrypting, setDecrypting] = useState<boolean>(false);
  const [expandedChildId, setExpandedChildId] = useState<string | null>(null);
  const [decryptedChildMessages, setDecryptedChildMessages] = useState<Record<string, string>>({});
  const [secretViews, setSecretViews] = useState<Record<string, SecretViews>>({});
  const [decryptingChild, setDecryptingChild] = useState<boolean>(false);
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [previousPath, setPreviousPath] = useState<string>("");
  const [showViewersPopup, setShowViewersPopup] = useState<boolean>(false);
  const [currentSecretViews, setCurrentSecretViews] = useState<SecretViews | null>(null);
  
  const { signer, provider, address } = useWallet();
  const { initDataRaw, userData, directLinkData } = useUser();
  const { isInit, decryptDataFromBytes } = useTaco({
    domain,
    provider,
    ritualId,
  });
  


  const handleAddClick = (): void => {
    navigate("/add");
  };

  const handleSetActiveTabClick = (tabActive: TabType): void => {
    setMyData([]);
    setExpandedId(null);
    setExpandedChildId(null);
    tabActive === "mydata" ? fetchMyData() : fetchSharedWithMyData();
    setActiveTab(tabActive);
  };

  const fetchMyData = async () => {
    try {
      // Pass initDataRaw which might be null for web login
      setIsLoading(true);
      const response: Secret[] = await GetMyData(initDataRaw || undefined);
      const data: DataItem[] = response.map((item: Secret) => ({
        id: item._id, 
        key: item.key,
        value: item.value,
        sharedWith: item.sharedWith,
        createdAt: item.createdAt,
      }));
      setMyData(data);
      if(data.length > 0) getProfilesDetailsForUsers(data);
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
    try{
      const enrichedData: DataItem[] = await Promise.all(
        data.map(async (item) => {
          const userDetails = await Promise.all(
            item.sharedWith.map(async (user) => {
              if(!user.username){
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

      setMyData(enrichedData);
    } catch (error) {
      console.log(error);
    }
  };
  
  const fetchSharedWithMyData = async () => {
    try {
      setIsLoading(true);
      const data = await getDataSharedWithMy(initDataRaw || undefined);
      setSharedWithMyData(data.sharedWithMe);
      if(data.sharedWithMe.length > 0) getProfilesDetailsForUsersSharedBy(data.sharedWithMe);
      setAuthError(null); // Clear any previous auth errors on success
    } catch (err) {
      console.error("Error fetching shared data:", err);
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
          img: profile.img ?? { src: noUserImage},
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
    setSharedWithMyData(enrichedData);
  };
  

  useEffect(() => {
    if (directLinkData) {
      handleSetActiveTabClick(directLinkData.tabName);
    } else {
      fetchMyData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (location.pathname === '/' && (previousPath === '/add' || previousPath === '/settings')) {
      handleSetActiveTabClick(activeTab);
    }
    
    // Update previous path
    setPreviousPath(location.pathname);
  }, [location.pathname]); 
 
  const handleDelete = async (id: string, isHasSharedWith: boolean) => {
    const MetroSwalOptions: string | SweetAlertOptions = {
      title: 'Do you want to delete this Secret?',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: `var(--primary-color)`
    };
    
    if (isHasSharedWith) {
      MetroSwalOptions.input = 'checkbox';
      MetroSwalOptions.inputPlaceholder = 'Also delete for everyone it was shared with';
      MetroSwalOptions.customClass = {
        ...MetroSwalOptions.customClass,
        input: 'metro-swal-checkbox-input'
      };
    }
  
    const result = await MetroSwal.fire(MetroSwalOptions);
    if (result.isConfirmed) {
      try {
        if (isHasSharedWith) {
          const alsoDeleteForEveryone = result.value === 1;
          alsoDeleteForEveryone ? 
            await deletePassword(initDataRaw || ""  , id ) : 
            await hidePassword(initDataRaw || ""  , id);
        } else {
          await deletePassword(initDataRaw || "" , id);
        }
        setMyData((prev) => prev.filter((secret) => secret.id !== id));
      } catch (error) {
        const appError = createAppError(error, 'unknown');
        showError(appError, 'Delete Secret Error');
      }
    }
  };


  // This function is to handle the case of pressing the button of the message that arrived to him as a notification
  const handleDirectLink = () => {
    if(directLinkData){
        const element = itemRefs.current[directLinkData.secretId];
        if (element) {
          let pass;
          if(directLinkData.tabName === "shared"){
            pass = sharedWithMyData
            .flatMap(item => item.passwords)
            .find(p => p.id === directLinkData.secretId);
          } else {
            pass = myData.find(p => p.id === directLinkData.secretId);
          }
    
          if (pass) {
            toggleExpand(pass.value, pass.id);
          }
          
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.classList.add("highlight");
            setTimeout(() => {
              element.classList.remove("highlight");
            }, 500);
          }, 1000);
        }
    }
  };
  
  const handleDirectLinkForChildren = () => {
    if(!directLinkData || !directLinkData.ChildId){ return; }
    const targetId = directLinkData?.ChildId;
    if(!targetId) return;
    const element = itemRefs.current[targetId];
    if (element) {
      let pass;
      if(activeTab === "mydata"){
        pass = myData.find(p => p.id === directLinkData.secretId)
                ?.children?.find(e => e._id === targetId);

      } else {
        pass = sharedWithMyData
        .flatMap(item => item.passwords)
        .find(p => p.id === directLinkData.secretId)
        ?.children?.find(e => e._id === targetId);
      }

      if (pass) {
        toggleChildExpand(pass.value, pass._id);
      }
      
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("highlight");
        setTimeout(() => {
          element.classList.remove("highlight");
        }, 500);
      }, 1000);
    }
  };

  const toggleExpand = async (value: string, id: string) => {
    setDecrypting(false);
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
  
      if (!decryptedMessages[id]) {
        decryptMessage(id, value);
      }
      await setSecretView(initDataRaw!, id);
      triggerGetChildrenForSecret(id);
      const secretViews = await getSecretViews(initDataRaw!, id);
      setSecretViews((prev) => ({ ...prev, [id]: secretViews }));
    }
  };

  const triggerGetChildrenForSecret = async (id: string) => {
    const response = await getChildrenForSecret(initDataRaw!, id);
    if ("message" in response) { return; }

    const entries = await Promise.all(
      response.map(async (child) => {
        const views = await getSecretViews(initDataRaw!, child._id);
        const hasMyView = views.viewDetails.some(sec => sec.publicAddress.toLowerCase() === address?.toLowerCase());
        views.isNewSecret = !hasMyView;
        if(child.publicAddress.toLowerCase() === address?.toLowerCase() || userData?.privacyMode) views.isNewSecret = false;
        return [child._id, views] as const;
      })
    );

    setSecretViews((prev) => ({
      ...prev,
      ...Object.fromEntries(entries),
    }));
    
    if (activeTab === "mydata") {
        setMyData((prev) => prev.map((item) =>
            item.id === id ? { ...item, children: response } : item ));
      } else {
        setSharedWithMyData((prev) => prev.map((item) => ({ ...item,
            passwords: item.passwords.map((pw) =>
            pw.id === id ? { ...pw, children: response } : pw )}))
        );
      }
  };
  
const decryptMessage = async (id: string, encryptedText: string) => {
  if (!encryptedText || !provider || !signer) return;
  try {
    setDecrypting(true);
    console.log("Decrypting message...");
    const decryptedBytes = await decryptDataFromBytes(
      fromHexString(encryptedText)
    );
    if (decryptedBytes) {
      const decrypted = fromBytes(decryptedBytes);
      setDecryptedMessages((prev) => ({ ...prev, [id]: decrypted }));
    }
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown decryption error";

    console.error("Error decrypting:", errorMessage);

    setDecryptErrors((prev) => ({
      ...prev,
      [id]: errorMessage,
    }));
  } finally {
    setDecrypting(false);
  }
};


  const toggleChildExpand = async (value: string, childId: string) => {
    setDecryptingChild(false);
    await setSecretView(initDataRaw!, childId);
    if (expandedChildId === childId) {
      setExpandedChildId(null);
    } else {
      setExpandedChildId(childId);
      if (!decryptedChildMessages[childId]) {
        decryptChildMessage(childId, value);
      }
    }
  };

  const decryptChildMessage = async (childId: string, encryptedText: string) => {
    if (!encryptedText || !provider || !signer) return;
    try {
      setDecryptingChild(true);
      const decryptedBytes = await decryptDataFromBytes(
        fromHexString(encryptedText)
      );
      if (decryptedBytes) {
        const decrypted = fromBytes(decryptedBytes);
        setDecryptedChildMessages((prev) => ({ ...prev, [childId]: decrypted }));
        if(secretViews[childId].isNewSecret) secretViews[childId].isNewSecret = false;
      }
    } catch (e) {
      console.error("Error decrypting child:", e);
    } finally {
      setDecryptingChild(false);
    }
  };

    const handleGetSecretViews = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, secretId: string) => {
        e.stopPropagation();
        const data = await handleCheckSecretViewsData(e, secretId);
        if (data) {
            setCurrentSecretViews(data);
            setShowViewersPopup(true);
        }
    };

  const handleCheckSecretViewsData = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: string): SecretViews | null => {
    e.stopPropagation();
    const data = secretViews[id];
    
    if (!data || data.viewDetails.length === 0) {
      MetroSwal.fire({
        icon: 'info',
        title: 'No Views',
        text: 'No one has viewed this message yet.',
        confirmButtonColor: 'var(--primary-color)'
      });
      return null;
    }

    return data;
  };
  

  const value = {
    myData, 
    sharedWithMyData, 
    setSharedWithMyData,
    activeTab, 
    handleAddClick, 
    handleSetActiveTabClick, 
    handleDelete, 
    triggerGetChildrenForSecret,
    handleGetSecretViews,
    handleDirectLink,
    handleDirectLinkForChildren,
    setShowViewersPopup,
    showViewersPopup,
    currentSecretViews,
    isInit, 
    provider, 
    userData, 
    initDataRaw,
    decrypting, 
    decryptedMessages,
    decryptErrors, 
    toggleExpand, 
    expandedId, 
    toggleChildExpand, 
    expandedChildId, 
    decryptingChild, 
    decryptedChildMessages,
    isLoading,
    authError,
    secretViews,
    itemRefs
  };

  return (
    <HomeContext.Provider value={value}>
      {children}
    </HomeContext.Provider>
  );
}

export function useHome() {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error("useHome must be used within a HomeProvider");
  }
  return context;
}