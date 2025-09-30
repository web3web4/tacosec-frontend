import { useWallet } from "@/wallet/walletContext";
import { ChildDataItem } from "@/types/types";
import { useEffect, useState } from "react";
import { formatDate } from "@/utils";
import { useHome } from "@/context";
import { showIcon } from "@/assets";
import { UserDisplayToggle } from "@/components";
import "./ChildrenSection.css";

interface ChildrenSectionProps {
  children: ChildDataItem[];
  toggleChildExpand: (value: string, childId: string) => void;
  expandedChildId: string | null;
  decryptingChild: boolean;
  decryptedChildMessages: Record<string, string>;
  itemRefs: React.RefObject<{ [key: string]: HTMLDivElement | null }>,
  handleDirectLinkForChildren: () => void
}

export default function ChildrenSection({
  children,
  toggleChildExpand,
  expandedChildId,
  decryptingChild,
  decryptedChildMessages,
  handleDirectLinkForChildren,
  itemRefs
}: ChildrenSectionProps) {

  const [copied, setCopied] = useState(false);
  const { secretViews, handleGetSecretViews } = useHome();
  const { address } = useWallet();

  useEffect(() => {
    if(address) handleDirectLinkForChildren();
  }, [address]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <div className="children-section">
      <h4 className="children-title"> {children.length} Replies to Secret:</h4>
      <div className="children-list">
        {children.map((child) => (
          <div 
            key={child._id} 
            className="child-item"
            ref={(el) => { itemRefs.current[child._id] = el }} 
          >
            <div 
              className="child-header"
              onClick={(e) => {
                e.stopPropagation();
                if (toggleChildExpand) {
                  toggleChildExpand(child.value, child._id);
                }
              }}
            >
              <div className="child-info">
              <div className="child-meta">
                  <strong>By:</strong>
                    <div className="child-date">
                      <UserDisplayToggle userData={child}/>
                    </div>
                    {secretViews[child._id].isNewSecret && <div className="child-status">new</div>}
                </div>
                <div className="child-meta">
                  <strong>At:</strong>
                  <span className="child-date">
                      {child.createdAt ? formatDate(child.createdAt) : "Hidden for privacy"}
                  </span>
                </div>
              </div>
              <span className="child-toggle">
                {expandedChildId === child._id ? '▼' : '▶'}
              </span>
            </div>
            
            {expandedChildId === child._id && (
              <div className="child-expanded">
                <p className="child-secret">
                  {decryptingChild ? (
                    <span className="decrypting-animation">
                      Decrypting
                      <span className="dots">
                        <span>.</span>
                        <span>.</span>
                        <span>.</span>
                      </span>
                    </span>
                  ) : (
                    decryptedChildMessages[child._id] || "Failed to decrypt"
                  )}
                </p>
                
                <div className="child-button-group">
                  <button
                    className="copy-button child-copy"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (decryptedChildMessages[child._id]) {
                        handleCopy(decryptedChildMessages[child._id]);
                      }
                    }}
                  >
                     {copied ? "Copied!" : "Copy"}
                  </button>
                  <div className="secret-view-section">
                    <button className="view-icon-button" onClick={(e)=> handleGetSecretViews(e, child._id)}>
                      <img src={showIcon} alt="view-icon" width={15} height={15}/>
                    </button>
                    <span>
                      {secretViews[child._id] ? secretViews[child._id].totalViews : 0}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}