export type AuthMethod = "telegram" | "web";

export interface initDataType {
  _id: string,
    telegramId: string,
    firstName: string,
    lastName: string,
    username: string,
    authDate: string,
    hash: string,
    isActive: boolean,
    createdAt: string,
    updatedAt: string,
    privacyMode: boolean
}

export interface AuthDataType {
  access_token: string,
}

export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
};

export interface DataItem {
  id : string
  key: string,
  value: string,
  createdAt: string,
  sharedWith: ShareWith[],
  shareWithDetails?: UserProfileDetailsType[], // this property not get from backend, we add just for help, we store account telegram details according by username here to For ease
  children?: ChildDataItem[] // also this for help my to store children for each secret
}
interface ShareWith {
  username: string, 
  invited?: boolean
}

export interface ChildDataItem {
  _id: string,
  key: string,
  value: string,
  username: string  
  createdAt: string,
  firstName: string,
  lastName: string,
}
export interface SharedWithMyDataType{
  sharedByDetails?: UserProfileDetailsType, // this property not get from backend, we add just for help, we store account telegram details according by username here to For ease
  username : string,
  passwords: {
    id: string,
    key: string,
    value: string,
    reports: ReportsResponse[],
    sharedWith: ShareWith[],
    createdAt: string,
    children?: ChildDataItem[] // also this for help my to store children for each secret
  }[]
}
  
export type TabType = "mydata" | "shared";


export interface UserProfileType{
  data: UserProfileDetailsType,
  error: string | null
}

export interface UserProfileDetailsType{
  img: { src: string} | null,
  name: string,
  username: string | null,
  invited?: boolean
}

export interface SearchDataType{
  username: string;
  firstName: string;
  lastName: string;
  isPreviouslyShared: boolean;
}
export type GetUserProfileDetailsResponse = UserProfileDetailsType | null;

export interface Report {
  reportedUsername: string;
  report_type: ReportType;
  secret_id: string;
  reason: string;
}

export interface ReportsResponse {
  id: string;
  reason: ReportType;
  createdAt: string;
  report_type: string
  reporterUsername: string;
}

export type ReportType = 'Security' | 'Abuse' | 'Spam' | 'Other';

export interface ContactSupportProps {
  setShowSupportPopup: (value: boolean) => void;
}

export interface SupportData {
  subject: string;
  message: string;
}

export interface SelectedSecretType{
  parentSecretId: string,
  parentUsername?: string,
  shareWith: {username: string, invited?:boolean}[],
  }

export interface SecretViews {
  totalViews: number;
  uniqueViewers: number,
  totalSharedUsers: number;
  viewDetails: ViewDetails[];
  isNewSecret: boolean
} 

export interface ViewDetails{
  telegramId: string,
  username: string,
  viewedAt: string,
  firstName: string,
  lastName: string,
  img?: string, // This property not get from backend, we used for stored img from another endpoint 
}