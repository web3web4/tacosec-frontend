import CustomPopup from "@/components/CustomPopup/CustomPopup";
import { UserDisplayToggle } from "@/components";
import { ReportsResponse } from "@/types/types";
import React, { SetStateAction } from "react";
import { formatDate } from "@/utils";
import "./ViewReportsPopup.css";

interface ViewReportsPopupProps {
  showViewReportsPopup: boolean;
  setShowViewReportsPopup: React.Dispatch<SetStateAction<boolean>>;
  reports: ReportsResponse[];
  secretKey: string;
}

export default function ViewReportsPopup({
  showViewReportsPopup,
  setShowViewReportsPopup,
  reports,
  secretKey
}: ViewReportsPopupProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Security': return '🔒';
      case 'Abuse': return '⚠️';
      case 'Spam': return '🚫';
      case 'Other': return '📝';
      default: return '📝';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Security': return '#dc3545';
      case 'Abuse': return '#fd7e14';
      case 'Spam': return '#6f42c1';
      case 'Other': return '#BF0BC9';
      default: return '#BF0BC9';
    }
  };

  return (
    <CustomPopup open={showViewReportsPopup} closed={setShowViewReportsPopup}>
      <div className="view-reports-popup">
        <h3>Reports for: {secretKey} ({reports.length} total)</h3>
        <div className="reports-container">
          {reports.map((report, i) => (
            <div key={i} className="report-item">
              <div className="report-header">
                <span className="report-icon">{getTypeIcon(report.report_type)}</span>
                <div 
                  className="report-title"
                  style={{ color: getTypeColor(report.report_type) }}
                >
                  {report.report_type} Report #{i + 1}
                </div>
              </div>
              
              <div className="report-reason">
                {report.reason}
              </div>
              
              <div className="report-meta">
                <div className="report-details">
                  <div><strong>Reported by:</strong><UserDisplayToggle  userData={report}/></div>
                  <div><strong>Date:</strong> {formatDate(report.createdAt)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CustomPopup>
  );
}