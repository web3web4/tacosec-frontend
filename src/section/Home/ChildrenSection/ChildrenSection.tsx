import { useState } from "react";
import { ChildDataItem } from "../../../types/types";
import { formatDate } from "../../../utils/tools";
import "./ChildrenSection.css";

interface ChildrenSectionProps {
  children: ChildDataItem[];
  parentIndex: number;
  toggleChildExpand?: (parentIndex: number, childIndex: number, value: string, childId: string) => void;
  expandedChildIndex: Record<number, number | null>;
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
                  toggleChildExpand(parentIndex, childIndex, child.value, child._id);
                }
              }}
            >
              <div className="child-info">
                <div className="child-meta">
                  <strong>Created by:</strong>
                  <span className="child-username"> {child.username}</span>
                </div>
                <div className="child-meta">
                <strong>Created At:</strong>
                <span className="child-date">{formatDate(child.createdAt)}</span>
                </div>
              </div>
              <span className="child-toggle">
                {expandedChildIndex[parentIndex] === childIndex ? '▼' : '▶'}
              </span>
            </div>
            
            {expandedChildIndex[parentIndex] === childIndex && (
              <div className="child-expanded">
                <p className="child-secret">
                  Secret:{" "}
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
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}