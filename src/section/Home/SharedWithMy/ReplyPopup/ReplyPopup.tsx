import React, { SetStateAction } from "react";
import CustomPopup from "../../../../components/CustomPopup/CustomPopup";
import useReplyToSecret from "../../../../hooks/useReplyToSecret";
import "./ReplyPopup.css";
import { SelectedSecretType } from "../../../../types/types";

interface ReplyPopupProps{
    showReplyPopup: boolean,
    setShowReplyPopup: React.Dispatch<SetStateAction<boolean>>,
    selectedSecret: SelectedSecretType
}

export default function ReplyPopup({showReplyPopup, setShowReplyPopup, selectedSecret}: ReplyPopupProps) {
  const { replyForm, handleReplyFormChange, handleReplySubmit, isSubmittingReply } = useReplyToSecret(showReplyPopup, setShowReplyPopup, selectedSecret);
  
  return (
    <CustomPopup open={showReplyPopup} closed={setShowReplyPopup}>
        <div className="reply-popup">
          <h3>Reply to Secret</h3>
          <div className="reply-form">
            <div className="form-group">
              <label htmlFor="reply-title">Title</label>
              <input
                id="reply-title"
                type="text"
                value={replyForm.title}
                onChange={(e) => handleReplyFormChange('title', e.target.value)}
                placeholder="Enter reply title"
                maxLength={100}
              />
            </div>
            <div className="form-group">
              <label htmlFor="reply-message">Reply</label>
              <textarea
                id="reply-message"
                value={replyForm.reply}
                onChange={(e) => handleReplyFormChange('reply', e.target.value)}
                placeholder="Enter your reply..."
                rows={5}
                maxLength={1000}
              />
            </div>
            <div className="reply-actions">
              <button 
                className="cancel-btn" 
                onClick={() => setShowReplyPopup(false)}
                disabled={isSubmittingReply}
              >
                Cancel
              </button>
              <button 
                className="submit-btn" 
                onClick={handleReplySubmit}
              >
                {isSubmittingReply ? 'Sending...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </CustomPopup>
  )
}
