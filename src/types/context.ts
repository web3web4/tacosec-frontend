import { DataItem, DirectLinkData, initDataType, SecretViews, SharedWithMyDataType, TabType } from "./types";
import { Dispatch, SetStateAction } from "react";
import { ethers } from "ethers";

export interface HomeContextType {
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
  childrenLoading: Record<string, boolean>;
  itemRefs: React.RefObject<{ [key: string]: HTMLDivElement | null }>;
  directLinkData: DirectLinkData | null;
}

export interface UserContextType {
  userData: initDataType | null;
  initDataRaw: string | null;
  directLinkData: DirectLinkData | null;
  setDirectLinkData: React.Dispatch<React.SetStateAction<DirectLinkData | null>>;
  error: string | null;
  isBrowser: boolean;
  signUserData: (initData: initDataType) => Promise<void>;
  setUserData: React.Dispatch<React.SetStateAction<initDataType | null>>,
  getUserData: () => Promise<void>
}

export type NavigationCheck = () => boolean;

export type NavigationGuardContextType = {
  setNavigationCheck: (fn: NavigationCheck) => void;
  runNavigationCheck: () => boolean;
};
