import { ReportsResponse, SharedWithMyDataType } from "../../../types/types";
import defaultProfileImage from "../../../assets/images/no-User.png";
import DropdownMenu from "../../../components/DropdownMenu/DropdownMenu";
import { useState } from "react";
import "../../../components/SeedPhrase/SeedPhrase.css";
import useReplyToSecret from "../../../hooks/useReplyToSecret";
import ChildrenSection from "../ChildrenSection/ChildrenSection";
import { formatDate } from "../../../utils/tools";

interface MyDataType {
  sharedWithMyData: SharedWithMyDataType[];
  toggleExpand: (index: number, value: string, id: string) => void;
  expandedIndex: number | null;
  decrypting: boolean;
  decryptedMessages: Record<number, string>;
  handleReportUser: (secretId: string, reportedUsername: string) => void;
  handleViewReportsForSecret: (data: ReportsResponse[], secretKey: string) => void;
  toggleChildExpand: (parentIndex: number, childIndex: number, value: string, childId: string) => void,
  expandedChildIndex: Record<number, number | null>,
  decryptingChild: boolean,
  decryptedChildMessages: Record<string, string>,
}

  
export default function SharedWithMy({ sharedWithMyData, toggleExpand, expandedIndex, decrypting, decryptedMessages, handleReportUser, handleViewReportsForSecret, toggleChildExpand, expandedChildIndex = {}, decryptingChild = false, decryptedChildMessages = {} }: MyDataType) {
  const [showManualCopy, setShowManualCopy] = useState(false);
  const [manualCopyText, setManualCopyText] = useState("");
  const { handleReplyToSecret } = useReplyToSecret();
  const [copied, setCopied] = useState(false);

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
            const uniqueKey = Number(
              Array.from(pass.id)
                .map((char) => char.charCodeAt(0))
                .join("")
                .slice(0, 15)
            );

            return (
              <div
                key={uniqueKey}
                className="data-item"
                onClick={() => toggleExpand(uniqueKey, pass.value, pass.id)}
              >
                <div className="item-container">
                  <div className="item-header-info">
                    <p className="item-title">{pass.key}</p>
                    <div className="created-at-container">
                      <strong>Created At:</strong>
                      <span className="child-date">{formatDate(pass.createdAt)}</span>
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
                {expandedIndex === uniqueKey && (
                  <div className="expanded-box">
                    <p className="password-text"> Secret:{" "}
                      {decrypting ? (
                        <span className="decrypting-animation">
                          Decrypting
                          <span className="dots">
                            <span>.</span>
                            <span>.</span>
                            <span>.</span>
                          </span>
                        </span>
                      ) : (
                        decryptedMessages[uniqueKey] || "Failed to decrypt"
                      )}
                    </p>

                    <div className="button-group">
                      <button
                        className="copy-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (decryptedMessages[uniqueKey])
                            handleCopy(decryptedMessages[uniqueKey]);
                        }}>
                        {copied ? "Copied!" : "Copy"}
                      </button>
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
                                target.src = defaultProfileImage;
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
                        parentIndex={i}
                        toggleChildExpand={toggleChildExpand}
                        expandedChildIndex={expandedChildIndex}
                        decryptingChild={decryptingChild}
                        decryptedChildMessages={decryptedChildMessages}
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
