import { ReactNode, SetStateAction } from "react";
import { ChildDataItem, ReportsResponse, SecretViews, SelectedSecretType } from "./types";

export interface CustomPopupProps {
  children: ReactNode;
  open: boolean;
  closed: (value: boolean) => void;
}

export interface DotsLoaderProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export interface DropdownOption {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

export interface DropdownMenuProps {
  options: DropdownOption[];
  className?: string;
}

export interface TelegramInviteButtonProps {
  username: string;
  botUserName: string;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

export interface ChildrenSectionProps {
  children: ChildDataItem[];
  toggleChildExpand: (value: string, childId: string) => void;
  expandedChildId: string | null;
  decryptingChild: boolean;
  decryptedChildMessages: Record<string, string>;
  itemRefs: React.RefObject<{ [key: string]: HTMLDivElement | null }>,
  handleDirectLinkForChildren: () => void
}

export interface ReplyPopupProps{
    showReplyPopup: boolean,
    setShowReplyPopup: React.Dispatch<SetStateAction<boolean>>,
    selectedSecret: SelectedSecretType
}

export interface ReportUserPopupProps {
  showReportUserPopup: boolean;
  setShowReportUserPopup: React.Dispatch<SetStateAction<boolean>>;
  onSubmit: (reportData: { reportType: string; message: string }) => Promise<void>;
  isSubmitting: boolean;
}

export interface ViewReportsPopupProps {
  showViewReportsPopup: boolean;
  setShowViewReportsPopup: React.Dispatch<SetStateAction<boolean>>;
  reports: ReportsResponse[];
  secretKey: string;
}

export interface ViewersPopupProps {
  showViewersPopup: boolean;
  setShowViewersPopup: React.Dispatch<SetStateAction<boolean>>;
  secretViews: SecretViews | null;
}