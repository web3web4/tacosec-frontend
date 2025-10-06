import { useState } from "react";
import { reportUser } from "@/apiService";
import { Report, ReportsResponse, ReportType, SharedWithMyDataType, initDataType } from "@/types/types";
import { MetroSwal, showError, createAppError } from "@/utils";
import { useWallet } from "@/wallet/walletContext";

export interface ReportData {
  reportType: string;
  message: string;
}

export const useReportUser = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReportUserPopup, setShowReportUserPopup] = useState<boolean>(false);
  const [showViewReportsPopup, setShowViewReportsPopup] = useState<boolean>(false);
  const [currentReportData, setCurrentReportData] = useState<{ secretId: string; reportedAddress: string } | null>(null);
  const [currentReportsData, setCurrentReportsData] = useState<{ reports: ReportsResponse[]; secretKey: string } | null>(null);
  const { address } = useWallet();
  const handleReportUser = async (secretId: string, reportedAddress: string) => {
    setCurrentReportData({ secretId, reportedAddress });
    setShowReportUserPopup(true);
  };

  const handleViewReportsForSecret = async (data: ReportsResponse[], secretKey: string) => {
    if (data.length === 0) {
      MetroSwal.fire({
        icon: 'info',
        title: 'No Reports',
        text: 'No reports found for this secret.',
      });
      return;
    }
    
    setCurrentReportsData({ reports: data, secretKey });
    setShowViewReportsPopup(true);
  };

  const submitReport = async (
    reportData: { reportType: string; message: string },
    initDataRaw: string,
    userData: initDataType | null,
    updateSharedData: (updater: (data: SharedWithMyDataType[]) => SharedWithMyDataType[]) => void
  ) => {
    if (!currentReportData) return;

    const { secretId, reportedAddress } = currentReportData;
    setIsSubmitting(true);

    try {
      const newReport: Report = {
        secret_id: secretId,
        report_type: reportData.reportType as ReportType,
        reason: reportData.message,
        user: reportedAddress,
      };

      await reportUser(initDataRaw, newReport);
      const rep: ReportsResponse = {
        id: "",
        reason: newReport.reason as ReportType,
        report_type: newReport.report_type,
        username: userData?.username!,
        createdAt: new Date().toISOString(),
        publicAddress: address!
      };

      // Update the shared data to include the new report
      updateSharedData((prevData) =>
        prevData.map((item) => ({
          ...item,
          passwords: item.passwords.map((pass) =>
            pass.id === secretId
              ? {
                  ...pass,
                  reports: [...pass.reports, rep],
                }
              : pass
          ),
        }))
      );

      setShowReportUserPopup(false);
      setCurrentReportData(null);

      // Show success message
      await MetroSwal.fire({
        title: 'Report Submitted',
        text: `Your ${reportData.reportType} report has been submitted successfully and will be reviewed by our team.`,
        icon: 'success',
      });
    } catch (error) {
      const appError = createAppError(error, 'server', 'Failed to submit report');
      showError(appError, 'Report Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    showReportUserPopup,
    setShowReportUserPopup,
    showViewReportsPopup,
    setShowViewReportsPopup,
    currentReportData,
    currentReportsData,
    handleReportUser,
    handleViewReportsForSecret,
    submitReport,
  };
};