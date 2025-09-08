import { ContactSupportProps } from "@/types/types";
import { useContactSupport } from "@/hooks";

export default function ContactSupport({setShowSupportPopup}: ContactSupportProps) {
  const {supportForm, isSubmittingSupportRequest, handleSupportFormChange, handleSupportSubmit } = useContactSupport({setShowSupportPopup});

    return (
      <div className="support-popup">
            <h3>Contact Support</h3>
            <div className="support-form">
              <div className="form-group">
                <label htmlFor="support-subject">Subject *</label>
                <input
                  id="support-subject"
                  type="text"
                  value={supportForm.subject}
                  onChange={(e) => handleSupportFormChange('subject', e.target.value)}
                  placeholder="Brief description of your issue"
                  maxLength={100}
                />
              </div>
              <div className="form-group">
                <label htmlFor="support-message">Message *</label>
                <textarea
                  id="support-message"
                  value={supportForm.message}
                  onChange={(e) => handleSupportFormChange('message', e.target.value)}
                  placeholder="Please describe your issue in detail..."
                  rows={5}
                  maxLength={1000}
                />
              </div>
              <div className="support-actions">
                <button 
                  className="cancel-btn" 
                  onClick={() => setShowSupportPopup(false)}
                  disabled={isSubmittingSupportRequest}
                >
                  Cancel
                </button>
                <button 
                  className="submit-btn" 
                  onClick={handleSupportSubmit}
                  disabled={isSubmittingSupportRequest}
                >
                  {isSubmittingSupportRequest ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
    )
  }
  