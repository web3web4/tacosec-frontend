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
    directLinkData
  } = useHome();
  const [selectedSecret, setSelectedSecret] = useState<SelectedSecretType>({ parentSecretId: "", parentAddress: "", shareWith: [] });
  const [showReplyPopup, setShowReplyPopup] = useState<boolean>(false);
  const [showManualCopy, setShowManualCopy] = useState(false);
  const [manualCopyText, setManualCopyText] = useState("");
  const [copied, setCopied] = useState(false);
  const { address, signer } = useWallet();

  useEffect(() => {
    if (address && signer) handleDirectLink();
  }, [address, signer, directLinkData]);

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
                    options={[
                      {
                        label: "Reply",
                        onClick: () => {
                          setSelectedSecret({ parentSecretId: item.id, shareWith: item.sharedWith });
                          setShowReplyPopup(true);
                        }
                      }
                    ]}
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
                  <div>
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
                    <button
                      className="delete-button"
                      onClick={() => {
                        recordUserAction(`Button click: Delete item ${item.id}`);
                        handleDelete(item.id, item.sharedWith.length > 0);
                      }}
                    >
                      Delete
                    </button>
                  </div>
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
        <p className="no-data-message">No data available.</p>
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
