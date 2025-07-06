import { ReportsResponse, SharedWithMyDataType } from "../../../types/types";
import defaultProfileImage from "../../../assets/images/no-User.png";
import DropdownMenu from "../../../components/DropdownMenu/DropdownMenu";
import { useState } from "react";
import "../../../components/SeedPhrase/SeedPhrase.css";
interface MyDataType {
  sharedWithMyData: SharedWithMyDataType[];
  toggleExpand: (index: number, value: string) => void;
  expandedIndex: number | null;
  decrypting: boolean;
  decryptedMessages: Record<number, string>;
  handleReportUser: (secretId: string, reportedUsername: string) => void;
  handleViewReportsForSecret: (data: ReportsResponse[], secretKey: string) => void;
}

export default function SharedWithMy({ sharedWithMyData, toggleExpand, expandedIndex, decrypting, decryptedMessages, handleReportUser, handleViewReportsForSecret }: MyDataType) {
  const [showManualCopy, setShowManualCopy] = useState(false);
  const [manualCopyText, setManualCopyText] = useState("");

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    }).catch(() => {
      setManualCopyText(text);
      setShowManualCopy(true);
    });
  };

  return (
    <div className="data-list">
      {sharedWithMyData.length > 0 ? (
        sharedWithMyData.map((item) =>
          item.passwords.map((pass) => {
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
                onClick={() => toggleExpand(uniqueKey, pass.value)}
              >
                <div className="item-container">
                  <p className="item-title">{pass.key}</p>
                  <div onClick={(e) => e.stopPropagation()}>
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu
                        options={[
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
                        Copy
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
