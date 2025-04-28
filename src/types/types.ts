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
  key: string,
  value: string
}
  
export type TabType = "mydata" | "shared";