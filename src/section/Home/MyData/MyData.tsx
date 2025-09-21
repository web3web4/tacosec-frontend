import { useWallet } from "@/wallet/walletContext";
import { noUserImage, showIcon } from "@/assets";
import { useHome } from "@/context/HomeContext";
import { useEffect,  useState } from "react";
import { ChildrenSection } from "@/section";
import { DropdownMenu, DotsLoader } from "@/components";
import { useReplyToSecret } from "@/hooks";
import { formatDate } from "@/utils";
import "@/components/SeedPhrase/SeedPhrase.css";

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
      {myData.length > 0 ? (
            myData.map((item, i) => (
              <div ref={(el) => { itemRefs.current[item.id] = el }} key={i} className="data-item" >
                <div className="item-container" onClick={() => toggleExpand(item.value, item.id)}>
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
                              handleReplyToSecret({parentSecretId: item.id, shareWith: item.sharedWith});
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
                        <DotsLoader size="medium" />
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
                          onClick={() => handleDelete(item.id, item.sharedWith.length > 0)}
                        >
                          Delete
                        </button>
                      </div>
                      {item.sharedWith.length > 0 && (
                        <div className="secret-view-section">
                          <button className="view-icon-button" onClick={(e)=> handleGetSecretViews(e, item.id)}>
                            <img src={showIcon} alt="view-icon" width={15} height={15}/>
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
                              <span>{user.name}</span>
                            </div>
                          ))}
                        </div>
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
