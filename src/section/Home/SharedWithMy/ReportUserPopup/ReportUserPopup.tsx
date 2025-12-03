import { MetroSwal, createAppError, handleSilentError } from "@/utils";
import { SheetModal } from "@/components";
import { ReportUserPopupProps } from "@/types";
import { useState, useEffect } from "react";
import { ReportType } from "@/types/types";
import "./ReportUserPopup.css";

export default function ReportUserPopup({
  showReportUserPopup,
  setShowReportUserPopup,
  onSubmit,
  isSubmitting
}: ReportUserPopupProps) {
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('Other');
  const [reportMessage, setReportMessage] = useState('');
  const [validationError, setValidationError] = useState('');

  const reportTypes = [
    { type: 'Security' as ReportType, icon: '🔒' },
    { type: 'Abuse' as ReportType, icon: '⚠️' },
    { type: 'Spam' as ReportType, icon: '🚫' },
    { type: 'Other' as ReportType, icon: '📝', isPrimary: true }
  ];

  useEffect(() => {
    if (showReportUserPopup) {
      // Reset form when popup opens
      setSelectedReportType('Other');
      setReportMessage('');
      setValidationError('');
    }
  }, [showReportUserPopup]);

  const handleReportTypeSelect = (type: ReportType) => {
    setSelectedReportType(type);
    setValidationError('');
  };

  const handleSubmit = async () => {
    setValidationError('');

    if (!selectedReportType) {
      setValidationError('Please select a report type!');
      return;
    }

    if (!reportMessage || reportMessage.trim().length < 8) {
      setValidationError('Please provide at least 8 characters describing the issue!');
      return;
    }

    try {
      await onSubmit({
        reportType: selectedReportType,
        message: reportMessage.trim()
      });
      setShowReportUserPopup(false);
    } catch (error) {
      const appError = createAppError(error, 'unknown');
      handleSilentError(appError, 'ReportUserPopup submit');
      MetroSwal.fire({
        icon: 'error',
        title: 'Submit Failed',
        text: appError.message,
      });
    }
  };

  return (
    <SheetModal
      open={showReportUserPopup}
      onClose={setShowReportUserPopup}
      title="Report User"
    >
      <div className="report-popup">
        <div className="report-form">
          <div className="form-group">
            <label className="report-type-label">Select report type:</label>
            <div className="report-type-grid">
              {reportTypes.map((rt) => (
                <button
                  key={rt.type}
                  type="button"
                  className={`report-type-btn ${selectedReportType === rt.type ? 'selected' : ''}`}
                  onClick={() => handleReportTypeSelect(rt.type)}
                >
                  <div className="report-type-icon">{rt.icon}</div>
                  <div className="report-type-text">{rt.type}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="report-message">Describe the issue in detail:</label>
            <textarea
              id="report-message"
              value={reportMessage}
              onChange={(e) => setReportMessage(e.target.value)}
              placeholder="Describe the issue in detail..."
              rows={5}
              maxLength={1000}
              className="report-message-textarea"
            />
          </div>

          {validationError && (
            <div className="validation-error">
              {validationError}
            </div>
          )}

          <div className="report-actions">
            <button
              className="report-submit-btn"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </div>
      </div>
    </SheetModal>
  );
}