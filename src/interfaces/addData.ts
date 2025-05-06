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
    sharedWith?: { username: string; invited: boolean }[] | null;
    initData?: InitDataForBackend
  }