import CustomPopup from "@/components/CustomPopup/CustomPopup";
import useReplyToSecret from "@/hooks/useReplyToSecret";
import { ReplyPopupProps } from "@/types";
import "./ReplyPopup.css";

export default function ReplyPopup({showReplyPopup, setShowReplyPopup, selectedSecret}: ReplyPopupProps) {
  const { replyMessage, errorMessage, isSubmittingReply, handleReplyMessageChange, handleReplayToSecret } = useReplyToSecret({ setShowReplyPopup, selectedSecret});
  
  return (
    <CustomPopup open={showReplyPopup} closed={setShowReplyPopup}>
        <div className="reply-popup">
          <h3>Reply to Secret</h3>
          <div className="reply-form">
            <div className="form-group">
              <label htmlFor="reply-message">Reply</label>
              <textarea
                id="reply-message"
                value={replyMessage}
                onChange={(e) => handleReplyMessageChange(e.target.value)}
                placeholder="Enter your reply..."
                rows={5}
                maxLength={1000}
              />
            </div>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <div className="reply-actions">
              <button 
                className="cancel-btn" 
                onClick={() => setShowReplyPopup(false)}
              >
                Cancel
              </button>
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
      </CustomPopup>
  )
}
