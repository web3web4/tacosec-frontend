import ViewReportsPopup from "@/section/Home/SharedWithMy/ViewReportsPopup/ViewReportsPopup";
import ReportUserPopup from "@/section/Home/SharedWithMy/ReportUserPopup/ReportUserPopup";
import ReplyPopup from "@/section/Home/SharedWithMy/ReplyPopup/ReplyPopup";
import ViewersPopup from "@/section/Home/ViewersPopup/ViewersPopup";
import { DropdownMenu, UserDisplayToggle, DotsLoader, SkeletonLoader } from "@/components";
import { useReportUser } from "@/hooks/useReportUser";
import { SelectedSecretType } from "@/types/types";
import { useWallet } from "@/wallet/walletContext";
import { noUserImage, showIcon } from "@/assets";
import { useEffect, useState } from "react";
import { ChildrenSection } from "@/section";
import { formatDate, recordUserAction } from "@/utils";
import { useHome } from "@/context";
import { useNavigate } from "react-router-dom";
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
    decryptErrors,
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
  const [searchQuery, setSearchQuery] = useState("");
  const { address, signer } = useWallet();
  const navigate = useNavigate();

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

  // Filter data based on search query
  const filteredData = sharedWithMyData.map(item => ({
    ...item,
    passwords: item.passwords.filter((pass) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const titleMatch = pass.key.toLowerCase().includes(query);
      const dateMatch = pass.createdAt ? formatDate(pass.createdAt).toLowerCase().includes(query) : false;
      return titleMatch || dateMatch;
    })
  })).filter(item => item.passwords.length > 0);

  const totalResults = filteredData.reduce((sum, item) => sum + item.passwords.length, 0);

  return (
    <div className="data-list">
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {decrypting && "Decrypting secret..."}
      </div>
      
      {isLoading ? (
        <SkeletonLoader count={3} />
      ) : sharedWithMyData.length > 0 ? (
        <>
          <div className="search-filter-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search by title or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search secrets"
              />
              {searchQuery && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="search-results-count">
                {totalResults} {totalResults === 1 ? 'result' : 'results'} found
              </div>
            )}
          </div>
          {filteredData.length > 0 ? (
            filteredData.map((item) =>
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
                      {pass.lastViewed && (
                        <div className="created-at-container">
                          <strong>Last Viewed:</strong>
                          <span className="child-date">{" "}{formatDate(pass.lastViewed)}</span>
                        </div>
                      )}
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
                <p className="item-status" data-status="Shared">
                  <span>Shared</span>
                </p>
                {expandedId === pass.id && (
                  <div className="expanded-box">
                    <p className="password-text">
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
                        decryptedMessages[pass.id] || "Failed to decrypt"
                      )}
                    </p>

                    <div className="button-group">
                      <div className="action-buttons-left">
                        <button
                          className="copy-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (decryptedMessages[pass.id])
                              handleCopy(decryptedMessages[pass.id]);
                          }}>
                          {copied ? "Copied!" : "Copy"}
                        </button>
                        {decryptedMessages[pass.id] && (
                          <button
                            className="reply-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSecret({ parentSecretId: pass.id, parentAddress: item.sharedBy.publicAddress, shareWith: pass.sharedWith });
                              setShowReplyPopup(true);
                            }}
                            title="Reply to this secret"
                          >
                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C8.9 18 7.85 17.78 6.9 17.39L2 19L3.61 14.1C3.22 13.15 3 12.1 3 11C3 10.66 3.02 10.33 3.06 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Reply
                          </button>
                        )}
                      </div>
                      <div className="action-buttons-right">
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
          <div className="no-results-message">
            <div className="no-results-icon">🔍</div>
            <h3 className="no-results-title">No matches found</h3>
            <p className="no-results-description">
              No secrets match "{searchQuery}". Try a different search term.
            </p>
            <button 
              className="search-clear-btn-large"
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </button>
          </div>
        )}
        </>
      ) : (
        <div className="no-data-message">
          <div className="empty-icon">
            <svg width="54" height="42" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="16" height="12" stroke="currentColor" strokeWidth="2" />
              <path d="M1 1L9 8L17 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="empty-title">No Received Secrets</h3>
          <p className="empty-description">
            You haven't received any secrets yet. When someone shares a secret with you, it will appear here.
          </p>
          <button 
            className="empty-cta-button"
            onClick={() => navigate('/add')}
          >
            Create Your First Secret
          </button>
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
