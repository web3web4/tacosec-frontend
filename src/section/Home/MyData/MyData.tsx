import ReplyPopup from "@/section/Home/SharedWithMy/ReplyPopup/ReplyPopup";
import ViewersPopup from "@/section/Home/ViewersPopup/ViewersPopup";
import { DropdownMenu, UserDisplayToggle, DotsLoader } from "@/components";
import { SelectedSecretType } from "@/types/types";
import { useWallet } from "@/wallet/walletContext";
import { noUserImage, showIcon } from "@/assets";
import { useHome } from "@/context/HomeContext";
import { useEffect, useState } from "react";
import { ChildrenSection } from "@/section";
import { formatDate, recordUserAction, copyToClipboard } from "@/utils";
import "@/pages/Home/Home.css";

export default function MyData() {
  const {
    myData,
    toggleExpand,
    expandedId,
    decrypting,
    decryptedMessages,
    decryptErrors,
    handleDelete,
    toggleChildExpand,
    handleGetSecretViews,
    setShowViewersPopup,
    showViewersPopup,
    currentSecretViews,
    handleDirectLink,
    handleDirectLinkForChildren,
    expandedChildId,
    decryptingChild,
    decryptedChildMessages,
    secretViews,
    childrenLoading,
    itemRefs,
    directLinkData,
    isLoading,
    activeTab
  } = useHome();
  const [selectedSecret, setSelectedSecret] = useState<SelectedSecretType>({ parentSecretId: "", parentAddress: "", shareWith: [] });
  const [showReplyPopup, setShowReplyPopup] = useState<boolean>(false);
  const [showManualCopy, setShowManualCopy] = useState(false);
  const [manualCopyText, setManualCopyText] = useState("");
  const [copied, setCopied] = useState(false);
  const { address, signer } = useWallet();

  useEffect(() => {
    if (address && signer && !isLoading && activeTab === "mydata" && myData.length > 0) {
      handleDirectLink();
    }
  }, [address, signer, directLinkData, isLoading, activeTab, myData]);

  const handleCopy = (text: string) => {
    copyToClipboard(
      text,
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        setManualCopyText(text);
        setShowManualCopy(true);
      }
    );
  };

  return (
    <div className="data-list">
      <ReplyPopup showReplyPopup={showReplyPopup} setShowReplyPopup={setShowReplyPopup} selectedSecret={selectedSecret} />
      <ViewersPopup showViewersPopup={showViewersPopup} setShowViewersPopup={setShowViewersPopup} secretViews={currentSecretViews} />
      {myData.length > 0 ? (
        myData.map((item, i) => (
          <div ref={(el) => { itemRefs.current[item.id] = el }} key={i} className="data-item" >
            <div className="item-container" onClick={() => {
              recordUserAction(`Expand item: ${item.id}`);
              toggleExpand(item.value, item.id, false);
            }}>
              <div className="item-header-info">
                <p className="item-title">{item.key}</p>
                <div className="item-group">
                  <div className="created-at-container">
                    <strong>Created At:</strong>
                    <span className="child-date">{" "}{formatDate(item.createdAt)}</span>
                  </div>
                  <div className="item-toggle">
                    {expandedId === item.id ? '▼' : '▶'}
                  </div>
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu
                    options={[]}
                  />
                </div>
              </div>
            </div>{" "}
            <p
              className="item-status"
              data-status={
                item.sharedWith.length > 0 ? "Shared" : "Private"
              }
            >
              {item.sharedWith.length > 0 ? "Shared" : "Private"}
            </p>
            {expandedId === item.id && (
              <div className="expanded-box">
                <p className="password-text">
                  {decrypting ? (
                    <span className="decrypting-animation">
                      🗝️ Unlocking your secret
                      <span className="dots">
                        <span>.</span>
                        <span>.</span>
                        <span>.</span>
                      </span>
                    </span>
                  ) : decryptedMessages[item.id] ? (
                    decryptedMessages[item.id]
                  ) : decryptErrors[item.id]?.includes("conditions not satisfied") ? (
                    "⏳ Cannot decrypt yet, please wait until the unlock time."
                  ) : decryptErrors[item.id] ? (
                    `❌ ${decryptErrors[item.id]}`
                  ) : (
                    "❌ Failed to decrypt"
                  )}
                </p>


                <div className="button-group">
                  <div className="action-buttons-left">
                    <button
                      className="copy-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (decryptedMessages[item.id])
                          handleCopy(decryptedMessages[item.id]);
                      }}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    {decryptedMessages[item.id] && (
                      <button
                        className="reply-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSecret({ parentSecretId: item.id, shareWith: item.sharedWith });
                          setShowReplyPopup(true);
                        }}
                        title="Reply to this secret"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 8H13M3 8L7 4M3 8L7 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Reply
                      </button>
                    )}
                  </div>
                  <div className="action-buttons-right">
                    {item.sharedWith.length > 0 && (
                      <div className="secret-view-section">
                        <button className="view-icon-button" onClick={(e) => {
                          recordUserAction(`Button click: View stats for ${item.id}`);
                          handleGetSecretViews(e, item.id);
                        }}>
                          <img src={showIcon} alt="view-icon" width={15} height={15} />
                        </button>
                        <span>
                          {secretViews[item.id] ? secretViews[item.id].totalViews : 0}
                        </span>
                      </div>
                    )}
                    {decryptedMessages[item.id] && (
                      <button
                        className="delete-icon-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          recordUserAction(`Button click: Delete item ${item.id}`);
                          handleDelete(item.id, item.sharedWith.length > 0);
                        }}
                        title="Delete this secret"
                      >
                        <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 5L13.5 17C13.5 18.1046 12.6046 19 11.5 19H6.5C5.39543 19 4.5 18.1046 4.5 17L4 5M1 5H17M12 5V3C12 1.89543 11.1046 1 10 1H8C6.89543 1 6 1.89543 6 3V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7 9V15M11 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                {item.sharedWith.length > 0 && (
                  <div className="shared-section">
                    {" "}
                    <h4 className="shared-title">Shared with:</h4>
                    <div className="shared-users">
                      {item.shareWithDetails?.map((user, index) => (
                        <div className="shared-user" key={index}>
                          <img
                            src={user.img?.src}
                            alt="img"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = noUserImage;
                            }}
                          />
                          <span><UserDisplayToggle userData={user} /></span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {childrenLoading[item.id] && (
                  <div className="children-loading">
                    <DotsLoader />
                  </div>
                )}
                {item.children && item.children.length > 0 && (
                  <ChildrenSection
                    children={item.children}
                    toggleChildExpand={toggleChildExpand}
                    expandedChildId={expandedChildId}
                    decryptingChild={decryptingChild}
                    decryptedChildMessages={decryptedChildMessages}
                    handleDirectLinkForChildren={handleDirectLinkForChildren}
                    itemRefs={itemRefs}
                  />
                )}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="no-data-message">
          <div className="empty-icon">
            <svg width="48" height="54" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="8" width="14" height="9" stroke="currentColor" strokeWidth="2" />
              <path d="M4 8V5C4 2.79086 5.79086 1 8 1C10.2091 1 12 2.79086 12 5V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h3 className="empty-title">No Saved Secrets</h3>
          <p className="empty-description">
            You haven't created any secrets yet. Start by creating your first secret to securely store and share information.
          </p>
        </div>
      )}
      {showManualCopy && (
        <div className="manual-copy-modal">
          <div className="manual-copy-modal-content">
            <h3>Manual Copy</h3>
            <p>Copy your secret manually:</p>
            <textarea
              className="manual-copy-textarea"
              value={manualCopyText}
              readOnly
              onFocus={e => e.target.select()}
            />
            <button className="cancel-btn" onClick={() => setShowManualCopy(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
