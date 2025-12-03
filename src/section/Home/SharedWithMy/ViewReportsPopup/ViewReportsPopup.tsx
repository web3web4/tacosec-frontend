import { SheetModal } from "@/components";
import { UserDisplayToggle } from "@/components";
import { ViewReportsPopupProps } from "@/types";
import { formatDate } from "@/utils";
import "./ViewReportsPopup.css";

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
    <SheetModal
      open={showViewReportsPopup}
      onClose={setShowViewReportsPopup}
      title={`Reports for: ${secretKey} (${reports.length} total)`}
    >
      <div className="view-reports-popup">
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
                  <div><strong>Reported by:</strong><UserDisplayToggle userData={report.reporterInfo} /></div>
                  <div><strong>Date:</strong> {formatDate(report.createdAt)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SheetModal>
  );
}