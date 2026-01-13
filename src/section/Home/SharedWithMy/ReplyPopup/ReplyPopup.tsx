import { SheetModal } from "@/components";
import useReplyToSecret from "@/hooks/useReplyToSecret";
import { ReplyPopupProps } from "@/types";
import "./ReplyPopup.css";

export default function ReplyPopup({ showReplyPopup, setShowReplyPopup, selectedSecret }: ReplyPopupProps) {
  const { replyMessage, errorMessage, isSubmittingReply, handleReplyMessageChange, handleReplayToSecret } = useReplyToSecret({ setShowReplyPopup, selectedSecret });



  return (
    <SheetModal
      open={showReplyPopup}
      onClose={setShowReplyPopup}
      title="Reply to Secret"
    >
      <div className="reply-popup">
        <div className="reply-form">
          <div className="form-group">
            <label htmlFor="reply-message">Reply</label>
            <textarea
              id="reply-message"
              value={replyMessage}
              onChange={(e) => handleReplyMessageChange(e.target.value)}
              placeholder="Enter y..."
              rows={5}
              maxLength={1000}
            />
          </div>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <div className="reply-actions">
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
