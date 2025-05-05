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

export interface DataItem{
  id : string
  key: string,
  value: string,
  sharedWith: string[],
  shareWithDetails?: UserProfileDetailsType[]
}
  
export type TabType = "mydata" | "shared";

export interface UserProfileType{
  data: UserProfileDetailsType,
  error: string | null
}

export interface UserProfileDetailsType{
  img: { src: string} | null,
  name: string,
  username: string | null
}

export type GetUserProfileDetailsResponse = UserProfileDetailsType | null;