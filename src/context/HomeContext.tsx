import { hidePassword, deletePassword, getChildrenForSecret, getSecretViews } from "@/services";
import React, { createContext, useContext, useState, useEffect } from "react";
import { MetroSwal, createAppError, showError, config } from "@/utils";
import useSecretDecryption from "@/hooks/useSecretDecryption";
import { useLocation, useNavigate } from "react-router-dom";
import useSecretViews from "@/hooks/useSecretViews";
import { useWallet } from "@/wallet/walletContext";
import useDirectLink from "@/hooks/useDirectLink";
import useSecretData from "@/hooks/useSecretData";
import { SweetAlertOptions } from "sweetalert2";
import { HomeContextType, TabType } from "@/types";
import { useUser } from "@/context";
import { useTaco } from "@/hooks";


const ritualId = config.TACO_RITUAL_ID;
const domain = config.TACO_DOMAIN;

const HomeContext = createContext<HomeContextType | null>(null);

export function HomeProvider({ children }: { children: React.ReactNode }) {
  const { provider, address, signer } = useWallet();
  const secretDataHook = useSecretData();
  const secretViewsHook = useSecretViews();
  const navigate = useNavigate();
  const location = useLocation();
  const { secretViews, setSecretViews } = secretViewsHook;
  const { initDataRaw, userData, directLinkData } = useUser();
  const { isInit } = useTaco({ domain, provider, ritualId });
  const [previousPath, setPreviousPath] = useState<string>("");
  const [childrenLoading, setChildrenLoading] = useState<Record<string, boolean>>({});

  const triggerGetChildrenForSecret = async (id: string) => {
    try {
      const response = await getChildrenForSecret(initDataRaw!, id);
      if ("message" in response) {
        if (secretDataHook.activeTab === "mydata") {
          secretDataHook.setMyData((prev) => prev.map((item) =>
            item.id === id ? { ...item, children: [] } : item));
        } else {
          secretDataHook.setSharedWithMyData((prev) => prev.map((item) => ({
            ...item,
            passwords: item.passwords.map((pw) =>
              pw.id === id ? { ...pw, children: [] } : pw)
          }))
          );
        }
        return;
      }

      const entries = await Promise.all(
        response.map(async (child) => {
          const views = await getSecretViews(initDataRaw!, child._id);
          const hasMyView = views.viewDetails.some(sec => sec.publicAddress.toLowerCase() === address?.toLowerCase());
          views.isNewSecret = !hasMyView;
          if (child.publicAddress.toLowerCase() === address?.toLowerCase() || userData?.user?.privacyMode) views.isNewSecret = false;
          return [child._id, views] as const;
        })
      );

      setSecretViews((prev) => ({
        ...prev,
        ...Object.fromEntries(entries),
      }));

      if (secretDataHook.activeTab === "mydata") {
        secretDataHook.setMyData((prev) => prev.map((item) =>
          item.id === id ? { ...item, children: response } : item));
      } else {
        secretDataHook.setSharedWithMyData((prev) => prev.map((item) => ({
          ...item,
          passwords: item.passwords.map((pw) =>
            pw.id === id ? { ...pw, children: response } : pw)
        }))
        );
      }
    } finally {
      setChildrenLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const decryptionHook = useSecretDecryption({
    setChildrenLoading,
    triggerGetChildrenForSecret,
    secretViews,
    setSecretViews,
  });

  const directLinkHook = useDirectLink();

  const handleAddClick = (): void => {
    navigate("/add");
  };

  const handleSetActiveTabClick = (tabActive: string): void => {
    decryptionHook.setExpandedId(null);
    decryptionHook.setExpandedChildId(null);
    secretDataHook.handleSetActiveTab(tabActive as TabType);
  };

  useEffect(() => {
    if (directLinkData && signer) {
      secretDataHook.handleSetActiveTab(directLinkData.tabName);
    } else if (secretDataHook.myData.length === 0 && secretDataHook.activeTab === "mydata") {
      secretDataHook.fetchMyData();
    }
  }, [directLinkData, decryptionHook.toggleExpand]);

  useEffect(() => {
    if (location.pathname === '/' && (previousPath === '/add' || previousPath === '/settings')) {
      handleSetActiveTabClick(secretDataHook.activeTab);
    }

    // Update previous path
    setPreviousPath(location.pathname);
  }, [location.pathname]);


  const handleDelete = async (id: string, isHasSharedWith: boolean) => {
    const MetroSwalOptions: string | SweetAlertOptions = {
      title: 'Do you want to delete this Secret',
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
            await deletePassword(initDataRaw || "", id) :
            await hidePassword(initDataRaw || "", id);
        } else {
          await deletePassword(initDataRaw || "", id);
        }
        secretDataHook.setMyData((prev) => prev.filter((secret) => secret.id !== id));
      } catch (error) {
        const appError = createAppError(error, 'unknown');
        showError(appError, 'Delete Secret Error');
      }
    }
  };

  const value = {
    ...secretDataHook,
    ...decryptionHook,
    ...secretViewsHook,
    handleAddClick,
    handleSetActiveTabClick,
    handleDelete,
    triggerGetChildrenForSecret,
    handleDirectLink: () => directLinkHook.handleDirectLink(secretDataHook.myData, secretDataHook.sharedWithMyData, decryptionHook.toggleExpand),
    handleDirectLinkForChildren: () => directLinkHook.handleDirectLinkForChildren(secretDataHook.myData, secretDataHook.sharedWithMyData, secretDataHook.activeTab, decryptionHook.toggleChildExpand),
    isInit,
    provider,
    userData,
    initDataRaw,
    childrenLoading,
    itemRefs: directLinkHook.itemRefs
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