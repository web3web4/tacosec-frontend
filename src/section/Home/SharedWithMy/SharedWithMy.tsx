import ViewReportsPopup from "@/section/Home/SharedWithMy/ViewReportsPopup/ViewReportsPopup";
import ReportUserPopup from "@/section/Home/SharedWithMy/ReportUserPopup/ReportUserPopup";
import ReplyPopup from "@/section/Home/SharedWithMy/ReplyPopup/ReplyPopup";
import ViewersPopup from "@/section/Home/ViewersPopup/ViewersPopup";
import { DropdownMenu, UserDisplayToggle, DotsLoader } from "@/components";
import { useReportUser } from "@/hooks/useReportUser";
import { SelectedSecretType } from "@/types/types";
import { useWallet } from "@/wallet/walletContext";
import { noUserImage, showIcon } from "@/assets";
import { useEffect, useState } from "react";
import { ChildrenSection } from "@/section";
import { formatDate, recordUserAction } from "@/utils";
import { useHome } from "@/context";
import "@/pages/Home/Home.css";

export default function SharedWithMy() {
  const {
    decryptedChildMessages,
    decryptedMessages,
    sharedWithMyData,
    expandedChildId,
    decryptingChild,
    initDataRaw,
    secretViews,
    expandedId,
    decrypting,
    itemRefs,
    childrenLoading,
    userData,
    handleDirectLinkForChildren,
    handleGetSecretViews,
    setShowViewersPopup,
    showViewersPopup,
    currentSecretViews,
    setSharedWithMyData,
    toggleChildExpand,
    handleDirectLink,
    toggleExpand,
    directLinkData,
    isLoading,
    activeTab
  } = useHome();
  const {
    showViewReportsPopup,
    showReportUserPopup,
    currentReportsData,
    currentReportData,
    isSubmitting,
    handleViewReportsForSecret,
    setShowViewReportsPopup,
    setShowReportUserPopup,
    handleReportUser,
    submitReport,
  } = useReportUser();
  const [selectedSecret, setSelectedSecret] = useState<SelectedSecretType>({ parentSecretId: "", parentAddress: "", shareWith: [] });
  const [showReplyPopup, setShowReplyPopup] = useState<boolean>(false);
  const [showManualCopy, setShowManualCopy] = useState(false);
  const [manualCopyText, setManualCopyText] = useState("");
  const [copied, setCopied] = useState(false);
  const { address, signer } = useWallet();

  useEffect(() => {
    if (address && signer && !isLoading && activeTab === "shared" && sharedWithMyData.length > 0) {
      handleDirectLink();
    }
  }, [address, signer, directLinkData, isLoading, activeTab, sharedWithMyData]);

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
          item.passwords.map((pass) => {
            return (
              <div ref={(el) => { itemRefs.current[pass.id] = el }} key={pass.id} className="data-item" >
                <div className="item-container" onClick={() => {
                  recordUserAction(`Expand shared item: ${pass.id}`);
                  toggleExpand(pass.value, pass.id, false);
                }}>
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
                              setSelectedSecret({ parentSecretId: pass.id, parentAddress: item.sharedBy.publicAddress, shareWith: pass.sharedWith });
                              setShowReplyPopup(true);
                            }
                          },
                          {
                            label: "Report",
                            onClick: () => handleReportUser(pass.id, item.sharedBy.publicAddress),
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
                        <button className="view-icon-button" onClick={(e) => {
                          recordUserAction(`Button click: View stats for shared item ${pass.id}`);
                          handleGetSecretViews(e, pass.id);
                        }}>
                          <img src={showIcon} alt="view-icon" width={15} height={15} />
                        </button>
                        <span>
                          {secretViews[pass.id] ? secretViews[pass.id].totalViews : 0}
                        </span>
                      </div>
                    </div>

                    {item.sharedBy && (
                      <div className="shared-section">
                        <h4 className="shared-title">Shared By:</h4>
                        <div className="shared-users">
                          <div className="shared-user">
                            <img
                              src={item.sharedBy.img?.src}
                              alt="img"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = noUserImage;
                              }}
                            />
                            <span><UserDisplayToggle userData={item.sharedBy} /></span>
                          </div>
                        </div>
                      </div>
                    )}
                    {childrenLoading[pass.id] && (
                      <div className="children-loading">
                        <DotsLoader />
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
      <ReplyPopup showReplyPopup={showReplyPopup} setShowReplyPopup={setShowReplyPopup} selectedSecret={selectedSecret} />

      <ViewersPopup showViewersPopup={showViewersPopup} setShowViewersPopup={setShowViewersPopup} secretViews={currentSecretViews} />

      <ReportUserPopup
        showReportUserPopup={showReportUserPopup}
        setShowReportUserPopup={setShowReportUserPopup}
        onSubmit={(reportData) => submitReport(reportData, initDataRaw!, userData, setSharedWithMyData)}
        isSubmitting={isSubmitting}
      />

      <ViewReportsPopup
        showViewReportsPopup={showViewReportsPopup}
        setShowViewReportsPopup={setShowViewReportsPopup}
        reports={currentReportsData?.reports || []}
        secretKey={currentReportsData?.secretKey || ""}
      />

    </div>
  );
}
