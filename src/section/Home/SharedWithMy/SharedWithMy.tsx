import { useWallet } from "@/wallet/walletContext";
import { noUserImage, showIcon } from "@/assets";
import { ChildrenSection } from "@/section";
import { useEffect, useState } from "react";
import { DropdownMenu } from "@/components";
import { useReplyToSecret } from "@/hooks";
import { formatDate } from "@/utils";
import { useHome } from "@/context";
import "@/components/SeedPhrase/SeedPhrase.css";

export default function SharedWithMy() {
  const { 
    sharedWithMyData, 
    toggleExpand, 
    expandedId, 
    decrypting, 
    decryptedMessages, 
    handleReportUser, 
    handleViewReportsForSecret, 
    toggleChildExpand, 
    handleGetSecretViews,
    handleDirectLink,
    handleDirectLinkForChildren,
    expandedChildId, 
    decryptingChild, 
    decryptedChildMessages,
    secretViews,
    itemRefs
  } = useHome();
  const [showManualCopy, setShowManualCopy] = useState(false);
  const [manualCopyText, setManualCopyText] = useState("");
  const { handleReplyToSecret } = useReplyToSecret();
  const [copied, setCopied] = useState(false);
  const { address } = useWallet();

  useEffect(() => {
    if(address) handleDirectLink();
  }, [address]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      setManualCopyText(text);
      setShowManualCopy(true);
    });
  };

  return (
    <div className="data-list">
      {sharedWithMyData.length > 0 ? (
        sharedWithMyData.map((item) =>
          item.passwords.map((pass, i) => {
            return (
              <div ref={(el) => { itemRefs.current[pass.id] = el }} key={pass.id} className="data-item" >
                <div className="item-container" onClick={() => toggleExpand(pass.value, pass.id)}>
                  <div className="item-header-info">
                    <p className="item-title">{pass.key}</p>
                    <div className="item-group">
                      <div className="created-at-container">
                        <strong>Created At:</strong>
                        <span className="child-date">
                          {" "}
                          {pass.createdAt ? formatDate(pass.createdAt) : "Hidden for privacy"}
                        </span>
                      </div>
                      <div className="item-toggle">
                        {expandedId === pass.id ? '▼' : '▶'}
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
                              handleReplyToSecret({parentSecretId: pass.id, parentUsername: item.username, shareWith: pass.sharedWith});
                            } 
                          },
                          {
                            label: "Report",
                            onClick: () => handleReportUser(pass.id, item.sharedByDetails!.username!),
                          },
                          {
                            label: "View Reports",
                            onClick: () => handleViewReportsForSecret(pass.reports, pass.key),
                          },
                        ]}
                      />
                    </div>
                  </div>
                </div>{" "}
                <p className="item-status" data-status="Shared"> Shared </p>
                {expandedId === pass.id && (
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
                      ) : (
                        decryptedMessages[pass.id] || "Failed to decrypt"
                      )}
                    </p>

                    <div className="button-group">
                      <button
                        className="copy-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (decryptedMessages[pass.id])
                            handleCopy(decryptedMessages[pass.id]);
                        }}>
                        {copied ? "Copied!" : "Copy"}
                      </button>
                      <div className="secret-view-section">
                        <button className="view-icon-button" onClick={(e)=> handleGetSecretViews(e, pass.id)}>
                          <img src={showIcon} alt="view-icon" width={15} height={15}/>
                        </button>
                        <span>
                          {secretViews[pass.id] ? secretViews[pass.id].totalViews : 0}
                        </span>
                      </div>
                    </div>

                    {item.sharedByDetails && (
                      <div className="shared-section">
                        <h4 className="shared-title">Shared By:</h4>
                        <div className="shared-users">
                          <div className="shared-user">
                            <img
                              src={item.sharedByDetails.img?.src}
                              alt="img"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = noUserImage;
                              }}
                            />
                            <span>{item.sharedByDetails.name}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {pass.children && pass.children.length > 0 && (
                      <ChildrenSection
                        children={pass.children}
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
            );
          })
        )
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
  );
}
