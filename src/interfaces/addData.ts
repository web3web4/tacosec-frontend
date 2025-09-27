export interface InitDataForBackend {
    telegramId: number;
    firstName: string;
    lastName: string | undefined;
    username: string | undefined;
    authDate: string | null;
    hash: string | null;
}
export interface DataPayload {
    key: string;
    description: string;
    type: string;
    value: string;
    sharedWith?: { publicAddress: string; invited?: boolean }[] | null;
    parent_secret_id?: string,// if it's a child
    initData?: InitDataForBackend,
    expirationTime?: number // Unix timestamp for expiration
  }