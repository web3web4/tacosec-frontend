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
  sharedWith: ShareWith[],
  shareWithDetails?: UserProfileDetailsType[],
  children?: ChildDataItem[]
}

interface ShareWith {
  username: string, 
  invited?: boolean
}

export interface ChildDataItem {
  id: string,
  key: string,
  value: string
}
export interface SharedWithMyDataType{
  sharedByDetails?: UserProfileDetailsType,
  username : string,
  passwords: {
    id: string,
    key: string,
    value: string,
    reports: ReportsResponse[],
    sharedWith: ShareWith[],
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