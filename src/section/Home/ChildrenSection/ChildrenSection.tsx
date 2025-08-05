import viewIcon from "../../../assets/icons/show-icon.png";
import { useState } from "react";
import { ChildDataItem } from "../../../types/types";
import { formatDate } from "../../../utils/tools";
import "./ChildrenSection.css";
import { useHome } from "../../../context/HomeContext";

interface ChildrenSectionProps {
  children: ChildDataItem[];
  parentIndex: number;
  toggleChildExpand?: (parentIndex: number, value: string, childId: string) => void;
  expandedChildIndex: string | null;
  decryptingChild: boolean;
  decryptedChildMessages: Record<string, string>;
}

export default function ChildrenSection({
  children,
  parentIndex,
  toggleChildExpand,
  expandedChildIndex,
  decryptingChild,
  decryptedChildMessages,
}: ChildrenSectionProps) {

  const [copied, setCopied] = useState(false);
  const { secretViews, handleGetSecretViews } = useHome();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <div className="children-section">
      <h4 className="children-title">Replys To Secret:</h4>
      <div className="children-list">
        {children.map((child, childIndex) => (
          <div 
            key={child._id} 
            className="child-item"
          >
            <div 
              className="child-header"
              onClick={(e) => {
                e.stopPropagation();
                if (toggleChildExpand) {
                  toggleChildExpand(parentIndex, child.value, child._id);
                }
              }}
            >
              <div className="child-info">
              <div className="child-meta">
                  <strong>By:</strong>
                  <span className="child-date">{child.username}</span>
                </div>
                <div className="child-meta">
                  <strong>At:</strong>
                  <span className="child-date">{formatDate(child.createdAt)}</span>
                </div>
              </div>
              <span className="child-toggle">
                {expandedChildIndex === child._id ? '▼' : '▶'}
              </span>
            </div>
            
            {expandedChildIndex === child._id && (
              <div className="child-expanded">
                <p className="child-secret">
                  {decryptingChild ? (
                    <span>
                      Secret:{" "}
                      <span className="decrypting-animation">
                        Decrypting
                        <span className="dots">
                          <span>.</span>
                          <span>.</span>
                          <span>.</span>
                        </span>
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
                      <img src={viewIcon} alt="view-icon" width={15} height={15}/>
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