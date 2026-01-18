import { SheetModal } from "@/components";
import useReplyToSecret from "@/hooks/useReplyToSecret";
import { ReplyPopupProps } from "@/types";
import { useEffect, useState } from "react";
import "./ReplyPopup.css";

export default function ReplyPopup({ showReplyPopup, setShowReplyPopup, selectedSecret }: ReplyPopupProps) {
  const { replyMessage, errorMessage, isSubmittingReply, handleReplyMessageChange, handleReplayToSecret, clearDraft } = useReplyToSecret({ setShowReplyPopup, selectedSecret });
  const [hasDraft, setHasDraft] = useState(false);

  // Check if draft exists when popup opens
  useEffect(() => {
    if (showReplyPopup && selectedSecret.parentSecretId) {
      const draftKey = `reply_draft_${selectedSecret.parentSecretId}`;
      const savedDraft = localStorage.getItem(draftKey);
      setHasDraft(!!savedDraft);
    }
  }, [showReplyPopup, selectedSecret.parentSecretId]);



  return (
    <SheetModal
      open={showReplyPopup}
      onClose={setShowReplyPopup}
      title="Reply to Secret"
    >
      <div className="reply-popup">
        {hasDraft && replyMessage && (
          <div className="draft-indicator">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Draft restored</span>
          </div>
        )}
        <div className="reply-form">
          <div className="form-group">
            <label htmlFor="reply-message">Reply</label>
            <textarea
              id="reply-message"
              value={replyMessage}
              onChange={(e) => handleReplyMessageChange(e.target.value)}
              placeholder="Enter your reply here..."
              rows={5}
              maxLength={1000}
            />
          </div>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <div className="reply-actions">
            {replyMessage && (
              <button
                className="cancel-btn"
                onClick={clearDraft}
                disabled={isSubmittingReply}
              >
                Clear
              </button>
            )}
            <button
              className="submit-btn"
              onClick={handleReplayToSecret}
              disabled={isSubmittingReply}
            >
              {isSubmittingReply ? 'Sending...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </SheetModal>
  )
}
