import { AppError } from "@/utils";

export type AuthMethod = "telegram" | "web";

export interface initDataType {
  user: {
    _id?: string;
    telegramId: string;
    firstName: string;
    lastName: string;
    username: string;
    authDate: string;
    hash: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    privacyMode: boolean;
    publicAddress: string;
  };
  access_token: string;
  refresh_token: string;
  role: string;
}

export interface UserDetails {
  success: boolean;
  data: initDataType;
}

export interface DirectLinkData {
  secretId: string;
  tabName: TabType;
  ChildId: string | null;
}
export interface AuthDataType {
  access_token: string;
  refresh_token: string;
  user: {
    _id?: string;
    telegramId?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    authDate?: string;
    hash?: string;
    role: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    privacyMode?: boolean;
    publicAddress?: string;
  };
}

export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
};

export interface DataItem {
  id: string;
  key: string;
  value: string;
  createdAt: string;
  sharedWith: ShareWith[];
  shareWithDetails?: UserProfileDetailsType[]; // this property not get from backend, we add just for help, we store account telegram details according by username here to For ease
  children?: ChildDataItem[]; // also this for help my to store children for each secret
}
interface ShareWith {
  publicAddress: string;
  username: string;
  invited?: boolean;
  shouldSendTelegramNotification?: boolean;
}

export interface ChildDataItem {
  _id: string;
  key: string;
  value: string;
  username: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  publicAddress: string;
}
export interface SharedWithMyDataType {
  sharedBy: {
    userId: string;
    username: string;
    telegramId: string;
    publicAddress: string;
    // this property not get from backend, we add just for help, we store account telegram details according by username here to For ease
    img?: { src: string } | null;
    name?: string;
  };
  passwords: {
    id: string;
    key: string;
    value: string;
    reports: ReportsResponse[];
    sharedWith: ShareWith[];
    createdAt: string;
    children?: ChildDataItem[]; // also this for help my to store children for each secret
  }[];
}

export type TabType = "mydata" | "shared";

export interface UserProfileType {
  data: UserProfileDetailsType;
  error: string | null;
}

export interface UserProfileDetailsType {
  img: { src: string } | null;
  name: string;
  username: string | null;
  existsInPlatform: boolean | null;
  publicAddress?: string | null;
  invited?: boolean;
}

export interface SearchDataType {
  username: string;
  firstName: string;
  lastName: string;
  latestPublicAddress: string;
  isPreviouslyShared: boolean;
}
export type GetUserProfileDetailsResponse = UserProfileDetailsType | null;

export interface Report {
  user: string;
  report_type: ReportType;
  secret_id: string;
  reason: string;
}

export interface ReportsResponse {
  reporterInfo: {
    username?: string;
    userId?: string;
    telegramId?: string;
    latestPublicAddress: string;
  };
  secret_id: string;
  reason: ReportType;
  createdAt: string;
  report_type: string;
}

export type ReportType = "Security" | "Abuse" | "Spam" | "Other";

export interface ContactSupportProps {
  setShowSupportPopup: (value: boolean) => void;
}

export interface SupportData {
  subject: string;
  message: string;
}

export interface SelectedSecretType {
  parentSecretId: string;
  parentAddress?: string;
  shareWith: {
    publicAddress: string;
    invited?: boolean;
    shouldSendTelegramNotification?: boolean;
  }[];
}

export interface SecretViews {
  totalViews: number;
  uniqueViewers: number;
  totalSharedUsers: number;
  viewDetails: ViewDetails[];
  notViewedUsers: userViewDetails[];
  unknownUsers: userViewDetails[];
  isNewSecret: boolean;
}

export interface userViewDetails {
  publicAddress: string;
  telegramId: string;
  username: string;
  firstName: string;
  lastName: string;
  img?: string; // This property not get from backend, we used for stored img from another endpoint
}

export interface ViewDetails {
  publicAddress: string;
  telegramId?: string | null;
  username: string;
  viewedAt?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  img?: string; // This property not get from backend, we used for stored img from another endpoint
  type?: string; // Just For Help My
}

export interface Secret {
  _id: string;
  key: string;
  value: string;
  description: string;
  sharedWith: ShareWith[];
  updatedAt: string;
  createdAt: string;
  hidden: boolean;
  reports: unknown[];
  viewsCount: number;
}

export interface SharedWithMeResponse {
  sharedWithMe: SharedWithMyDataType[];
  userCount: number;
}

export interface StoragePublicKeyData {
  publicKey: string;
  secret?: string;
}

export interface ContractSupportResponse {
  success: string;
  adminTelegramId: string;
}

export interface PublicKeysResponse {
  success: boolean;
  data: PublicKeyRecord[];
  total: number;
}

export interface PublicKeyRecord {
  _id: string;
  publicKey: string;
  secret?: string;
  userTelegramId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileDetails {
  existsInPlatform: boolean;
  publicAddress: string;
  profile: string;
}

export interface FrontendLogPayload {
  level: "info" | "warn" | "error";
  type: AppError["type"];
  message: string;
  stack?: string | null;
  statusCode?: number | null;
  url: string;
  userAgent: string;
  timestamp: string;
  context?: string;
  userActions: string[];
  token: string | null;
  refreshToken: string | null;
  publicAddress: string | null;
  savePasswordInBackend: string | null;
}

export interface UserData {
  _id: string;
  username: string;
  Name: string;
  phone: string;
  telegramId: string;
  authDate: string;
  isActive: boolean;
  role: string;
  sharingRestricted: boolean;
  reportCount: number;
  privacyMode: boolean;
  joinedDate: string;
  lastActive: string;
  statistics: {
    secrets: number;
    views: number;
    reports: number;
  };
}

export interface AdminUsersResponse {
  data: UserData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  sharingRestrictedUsers: number;
}

export interface AdminReportsResponse {
  reports: ReportApiItem[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
  // Aggregate stats from backend (string-literal keys)
  "TOTAL REPORTS"?: number;
  "PENDING"?: number;
  "HIGH PRIORITY"?: number;
  "RESOLVED"?: number;
}

export interface ReportApiItem {
  id: string;
  reportType: string;
  reportDetails: string;
  reportedContent: string;
  contentOwner: string;
  secretId: string;
  reporterHandle: string;
  status: string;
  priority: string;
  reporterInfo?: {
    username?: string;
    userId?: string;
    telegramId?: string;
    latestPublicAddress?: string;
  };
  reportedUserInfo?: {
    username?: string;
    userId?: string;
    telegramId?: string;
    latestPublicAddress?: string;
  };
  createdDate: string;
  updatedDate: string;
  resolved?: boolean;
}

export interface TableColumn<T> {
  header: string;
  key: keyof T;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  className?: string;
  pagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export interface SecretRow {
  id: number;
  title: string;
  ownerName: string;
  ownerHandle: string;
  contactEmail: string;
  createdDate: string;
  lastViewed: string;
  statistics: {
    views: number;
    shares: number;
    reports: number;
  };
}

export interface AdminSecretsResponse {
  data: SecretApiItem[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface SecretApiItem {
  _id: string;
  title: string;
  description: string;
  isActive: boolean;
  sharedWith: {
    publicAddress: string;
    invited?: boolean;
    username?: string;
    userId?: string;
    shouldSendTelegramNotification?: boolean;
  }[];
  hidden: boolean;
  secretViews: unknown[];
  publicAddress: string;
  createdAt: string;
  updatedAt: string;
  ownerName: string;
  ownerHandle: string;
  contactEmail: string;
  statistics: {
    views: number;
    shares: number;
    reports: number;
  };
  lastViewed: string | null;
  userId?: {
    _id?: string;
    telegramId?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  };
}

export interface ReportRow {
  id: number;
  reportType: string;
  reportDetails: string;
  reportedContent: string;
  contentOwner: string;
  secretId: string;
  reporter: string;
  reporterHandle: string;
  status: string;
  priority: string;
  createdDate: string;
  updatedDate: string;
}
export interface AdminResponseActive {
  success: boolean;
  message: string;
  user: {
    _id: string;
    username: string;
    telegramId: string;
    isActive: boolean;
    firstName: string;
    lastName: string;
  };
}

export interface AddInformationUser {
  phone: string;
  firstName: string;
  lastName: string;
  email: string;
}
export interface AddInformationUserResponse {
  success: boolean;
  data: {
    id: string;
    phone: string;
    firstName: string;
    lastName: string;
    email: string;
    telegramId: string;
  };
}

export interface NotificationMetadata {
  senderPublicAddress?: string;
  recipientPublicAddress?: string;
  [key: string]: unknown;
}

export interface NotificationItem {
  _id: string;
  message: string;
  type: string;
  recipientUserId: string;
  senderUserId: string;
  subject: string;
  metadata?: NotificationMetadata;
  sentAt: string;
}

export interface AdminNotificationsResponse {
  notifications: NotificationItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface NotificationRow {
  id: string;
  subject: string;
  message: string;
  type: string;
  recipientUserId: string;
  senderUserId: string;
  metadata?: NotificationMetadata;
  sentAt: string;
}

export interface LogData {
  timestamp: string;
  context?: string;
  level: string;
  type: string;
  message: string;
  url?: string;
  userAgent?: string;
  userActions?: string[];
  publicAddress?: string | null;
  savePasswordInBackend?: string | null;
  stack?: string | null;
  statusCode?: number | null;
  token?: string | null;
  refreshToken?: string | null;
}

export interface LoggerItem {
  _id: string;
  userId: string;
  telegramId: string;
  username: string;
  logData: LogData;
  createdAt: string;
}

export interface AdminLoggerResponse {
  data: LoggerItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface LoggerRow {
  id: string;
  userId: string;
  telegramId: string;
  username: string;
  logData: LogData;
  createdAt: string;
}

export interface AlertsType {
  notifications: AlertsDetails[];
  pagination: {
    currentPage: number,
    totalPages: number,
    totalItems: number,
    itemsPerPage: number,
    hasNextPage: boolean,
    hasPrevPage: boolean
  }
}

export interface AlertsDetails {
  _id: string;
  message: string;
  createdAt: string;
  tabName: TabType;
  parentId: string;
  relatedEntityId: string
}