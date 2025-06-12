import defaultProfileImage from "../../../assets/images/no-User.png"
import { DataItem } from "../../../types/types";

interface MyDataType{
    myData: DataItem[],
    toggleExpand: (index: number, value: string) => void,
    expandedIndex: number | null,
    decrypting: boolean,
    decryptedMessages: Record<number, string>,
    handleDelete: (id: string) => void,
}

export default function MyData({myData, toggleExpand, expandedIndex, decrypting, decryptedMessages, handleDelete} : MyDataType) {

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
      };

  return (
    <div className="data-list">
      {myData.length > 0 ? (
            myData.map((item, i) => (
              <div
                key={i}
                className="data-item"
                onClick={() => toggleExpand(i, item.value)}
              >
                <p className="item-title">{item.key}</p>
                <p
                  className="item-status"
                  data-status={
                    item.sharedWith.length > 0 ? "Shared" : "Private"
                  }
                >
                  {item.sharedWith.length > 0 ? "Shared" : "Private"}
                </p>
                {expandedIndex === i && (
                  <div className="expanded-box">
                    <p className="password-text">
                      Secret:{" "}
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
                        decryptedMessages[i] || "Failed to decrypt"
                      )}
                    </p>

                    <div className="button-group">
                      <button
                        className="copy-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (decryptedMessages[i])
                            handleCopy(decryptedMessages[i]);
                        }}
                      >
                        Copy
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
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
                                  target.src = defaultProfileImage;
                                }}
                              />
                              <span>{user.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="no-data-message">No data available.</p>
          )}
    </div>
  )
}
