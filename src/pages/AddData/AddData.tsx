import { parseTelegramInitData, showError, createAppError, recordUserAction, config } from "@/utils";
import { CustomPopup, SectionErrorBoundary, TelegramInviteButton, UserDisplayToggle } from "@/components";
import { conditions, toHexString } from "@nucypher/taco";
import { storageEncryptedData } from "@/services";
import { DataPayload } from "@/types/component";
import { noUserImage } from "@/assets";
import { useWallet } from "@/wallet/walletContext";
import { MetroSwal } from "@/utils/metroSwal";
import Swal from "sweetalert2";
import { useAddData, useTaco } from "@/hooks";
import React, { useState } from "react";
import { useUser } from "@/context";
import { TimeConditionSection } from "./TimeConditionSection";
import "./AddData.css";
import { sanitizeTitle, sanitizePlainText } from "@/utils";
import { RiDeleteBinLine } from 'react-icons/ri';
import { MdLock, MdShield, MdInfo, MdVpnKey, MdCloud, MdLockOpen, MdDns, MdFingerprint, MdWarning } from 'react-icons/md';


const ritualId = config.TACO_RITUAL_ID;
const domain = config.TACO_DOMAIN;
const BOT_USER_NAME = config.BOT_USER_NAME;

const AddData: React.FC = () => {
  const {
    userProfile,
    isOpenPopup,
    searchData,
    shareList,
    shareWith,
    isSearch,
    message,
    name,
    closePopup,
    handleSearch,
    handleConfirmClick,
    handleSearchSelect,
    handleDeleteUser,
    handleAddShare,
    cleanFields,
    checkEncrypting,
    setMessage,
    setName,
  } = useAddData();

  const [encrypting, setEncrypting] = useState(false);
  const [encryptionStage, setEncryptionStage] = useState<'preparing' | 'encrypting' | 'saving' | null>(null);
  const [showEncryptionDetails, setShowEncryptionDetails] = useState(false);

  const [timeValues, setTimeValues] = useState({
    seconds: 0,
    minutes: 0,
    hours: 0,
    months: 0,
  });
  const [useTimeCondition, setUseTimeCondition] = useState(false);
  const [timeConditionType, setTimeConditionType] = useState<"unlock" | "expire">("unlock");
  const { provider, signer, address } = useWallet();
  const { initDataRaw, isBrowser } = useUser();

  const { isInit, encryptDataToBytes } = useTaco({
    domain,
    provider,
    ritualId,
  });

  if (!isInit || !provider) {
    return <div>Loading...</div>;
  }

  const encryptMessage = async () => {
    if (!provider) return;

    if (!checkEncrypting()) return;

    // Sanitize inputs prior to encryption and payload creation
    const safeMessage = sanitizePlainText(message, { maxLength: 5000, preserveNewlines: true });
    const safeName = sanitizeTitle(name);

    setEncrypting(true);
    setEncryptionStage('preparing');
    
    try {
      if (!signer) {
        console.error("Signer not found", signer);
        return;
      }

      // Simulate preparation stage
      await new Promise(resolve => setTimeout(resolve, 500));

      let publicAddresses: string[] = [
        address!,
        ...shareList
          .filter((item) => item.data.publicAddress !== null)
          .map((item) => item.data.publicAddress!)
      ];

      const checkUsersCondition =
        new conditions.base.contextVariable.ContextVariableCondition({
          contextVariable: ":userAddress",
          returnValueTest: {
            comparator: "in",
            value: publicAddresses,
          },
        });

      // Calculate future timestamp based on time period inputs
      const now = new Date();
      const currentTimestamp = Math.floor(now.getTime() / 1000); // always UTC-based

      // Convert all inputs to seconds
      const secondsToAdd = Number(timeValues.seconds) || 0;
      const minutesToAdd = (Number(timeValues.minutes) || 0) * 60;
      const hoursToAdd = (Number(timeValues.hours) || 0) * 60 * 60;
      const monthsToAdd = (Number(timeValues.months) || 0) * 30 * 24 * 60 * 60; // Approximate months as 30 days

      // Final timestamp (no timezone offset added, blockchain uses UTC!)
      let adjustedTimestamp =
        currentTimestamp +
        secondsToAdd +
        minutesToAdd +
        hoursToAdd +
        monthsToAdd;

      // ✅ Safety check: prevent negative or unrealistic values
      if (adjustedTimestamp < currentTimestamp) {
        console.warn(
          "Adjusted timestamp is earlier than current time. Resetting to current time."
        );
        adjustedTimestamp = currentTimestamp;
      }

      const tenYearsLater = currentTimestamp + 10 * 365 * 24 * 60 * 60;
      if (adjustedTimestamp > tenYearsLater) {
        console.warn(
          "Adjusted timestamp too far in the future. Resetting to 10 years later max."
        );
        adjustedTimestamp = tenYearsLater;
      }

      // Build the TimeCondition
      let compoundCondition;
      if (useTimeCondition) {
        let timeCondition;

        if (timeConditionType === "unlock") {
          timeCondition = new conditions.base.time.TimeCondition({
            chain: 80002,
            method: "blocktime",
            returnValueTest: {
              comparator: ">=",
              value: adjustedTimestamp,
            },
          });
        } else {
          timeCondition = new conditions.base.time.TimeCondition({
            chain: 80002,
            method: "blocktime",
            returnValueTest: {
              comparator: "<=",
              value: adjustedTimestamp,
            },
          });
        }

        compoundCondition = conditions.compound.CompoundCondition.and([
          checkUsersCondition,
          timeCondition,
        ]);
      } else {
        compoundCondition = checkUsersCondition;
      }

      console.log("Encrypting message...");
      setEncryptionStage('encrypting');
      const encryptedBytes = await encryptDataToBytes(
        safeMessage,
        compoundCondition,
        signer!
      );

      if (encryptedBytes) {
        setEncryptionStage('saving');
        const encryptedHex = toHexString(encryptedBytes);
        const parsedInitData = parseTelegramInitData(initDataRaw!);
        const sharedWithList: { publicAddress: string; invited: boolean }[] =
          shareList
            .filter((item) => item.data.publicAddress !== null)
            .map((item) => ({
              publicAddress: item.data.publicAddress!,
              invited: item.data.invited ?? false,
            }));

        const payload: DataPayload = {
          key: safeName,
          description: "",
          type: "text",
          value: encryptedHex!,
          sharedWith: sharedWithList,
        };
        // Only add initData if not from web (i.e., from Telegram)
        if (!isBrowser) {
          payload.initData = parsedInitData;
        }

        const res = await storageEncryptedData(payload, initDataRaw!);

        if (res) {
          await MetroSwal.fire({
            title: "🔐 Encrypted Successfully",
            html: "Your secret is now secured with end-to-end encryption. Only you and authorized recipients can decrypt it.",
            icon: "success",
            confirmButtonText: "Ok",
            confirmButtonColor: "var(--metro-green)",
          });

          cleanFields();
          // Reset time period inputs
          setTimeValues({
            seconds: 0,
            minutes: 0,
            hours: 0,
            months: 0,
          });
          setUseTimeCondition(false);
        }
      }
    } catch (e: unknown) {
      const appError = createAppError(e, "unknown");
      showError(appError, "Encryption Failed");
      // Keep form data so user can retry
    } finally {
      setEncrypting(false);
      setEncryptionStage(null);
    }
  };

  const handleClear = () => {
    const hasData =
      name ||
      message ||
      shareList.length > 0 ||
      timeValues.seconds > 0 ||
      timeValues.minutes > 0 ||
      timeValues.hours > 0 ||
      timeValues.months > 0;

    const resetForm = () => {
      cleanFields();
      setUseTimeCondition(false);
      setTimeConditionType("unlock");
      setTimeValues({
        seconds: 0,
        minutes: 0,
        hours: 0,
        months: 0,
      });
    };

    if (hasData) {
      MetroSwal.fire({
        title: "Clear all fields?",
        text: "This action cannot be undone.",
        showCancelButton: true,
        confirmButtonText: "Yes, clear it",
        icon: "warning",
      }).then((result) => {
        if (result.isConfirmed) {
          resetForm();
        }
      });
    } else {
      resetForm();
    }
  };

  return (
    <div className="add-data-container">
      {isOpenPopup && (
        <CustomPopup open={isOpenPopup} closed={closePopup}>
          <div className="popup-content">
            <img
              src={userProfile.data.img?.src}
              alt="user icon"
              width={80}
              height={80}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = noUserImage;
              }}
            />
            <p>{userProfile.error ? userProfile.error : userProfile.data.name}</p>
            {!userProfile.error && (
              userProfile.data.existsInPlatform ? (
                <button onClick={() => {
                  recordUserAction(`Button click: Confirm share with ${userProfile.data.name}`);
                  handleConfirmClick(userProfile.data);
                }}>
                  Confirm
                </button>
              ) : (
                <div>
                  <p className="not-found">
                    This user isn’t on our platform. Invite them to create a
                    public address, or share directly by entering a public address
                  </p>
                  <TelegramInviteButton
                    username={userProfile.data.username!}
                    botUserName={BOT_USER_NAME}
                    onClick={() => { }}>
                    Invite
                  </TelegramInviteButton>
                </div>
              )
            )}
            <button onClick={closePopup}>Cancel</button>
          </div>
        </CustomPopup>
      )}
      <div className="add-data-content-wrapper">
        <h2 className="page-title">
          <svg className="tab-icon" width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--metro-green)', marginRight: '0.5rem' }}>
            <rect x="1" y="8" width="14" height="9" stroke="currentColor" strokeWidth="2" />
            <path d="M4 8V5C4 2.79086 5.79086 1 8 1C10.2091 1 12 2.79086 12 5V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Save New Encrypted Secret
        </h2>
        <label>Title <span style={{ color: 'var(--danger)' }}>*</span></label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Facebook Password"
          className="input-field"
        />

        <label>
          Secret <span style={{ color: 'var(--danger)' }}>*</span>
          <span className="security-badge">
            <MdLock size={14} /> End-to-end encrypted
          </span>
        </label>
        <textarea
          placeholder="Enter your secret message, key, or data here..."
          className="input-field-textarea"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <div className="encryption-details-section">
          <button
            type="button"
            className="encryption-details-toggle"
            onClick={() => setShowEncryptionDetails(!showEncryptionDetails)}
          >
            <MdInfo size={16} />
            Encryption Details
            <span className={`toggle-icon ${showEncryptionDetails ? 'open' : ''}`}>▼</span>
          </button>
          {showEncryptionDetails && (
            <div className="encryption-details-content">
              <ul>
                <li><MdShield size={16} /> <strong>Protection:</strong> End-to-end encrypted</li>
                <li><MdLock size={16} /> <strong>Infra:</strong> TACo (Threshold Access Control)</li>
                <li><MdDns size={16} /> <strong>Protocol:</strong> Ferveo (threshold encryption)</li>
                <li><MdVpnKey size={16} /> <strong>Cryptography:</strong> BLS12-381 elliptic curves</li>
                <li><MdLockOpen size={16} /> <strong>Decryption:</strong> Multi-party computation (MPC)</li>
                <li>
                  <MdCloud size={16} /> <strong>Network:</strong> Decentralized node cohort
                </li>
                <li className="sub-list">
                  <ul>
                    <li>TACo Domain:&nbsp;<span className="sub-info">{domain}</span></li>
                    <li>Ritual ID:&nbsp;<span className="sub-info">{ritualId}</span></li>
                  </ul>
                </li></ul>
              <p className="encryption-info">
                🛡️ Your data is encrypted client-side. Decryption requires threshold consensus from independent nodes — no single party can access your secrets.
              </p>
            </div>
          )}
        </div>

        <div className="form-divider" />

        <label>Share with?</label>
        <p className="field-helper">Leave empty to keep your secret private</p>
        <div className="share-section-wrapper">
          <SectionErrorBoundary sectionName="ShareWithSection">
            <div className="share-with-row">
              <div className="autocomplete-wrapper">
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={shareWith}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="@username or 0x address"
                    className={`input-field ${shareWith.trim() ? 'has-pending-value' : ''}`}
                  />
                  {isSearch && <span className="spinner" />}
                  {shareWith.trim() && !isSearch && (
                    <div className="pending-share-hint">
                      <MdWarning size={14} /> Click + to add or clear field
                    </div>
                  )}
                </div>

                {searchData.length > 0 && (
                  <ul className="autocomplete-list">
                    {/* It was shared  previously */}
                    {searchData.some((item) => item.isPreviouslyShared) && (
                      <>
                        <li className="group-title">It was shared previously</li>
                        {searchData
                          .filter((item) => item.isPreviouslyShared)
                          .map((item, index) => (
                            <li
                              key={`shared-${index}`}
                              onClick={() => handleSearchSelect(item)}
                            >
                              <p>
                                {item.firstName} {item.lastName}
                              </p>
                              <p>@{item.username}</p>
                            </li>
                          ))}
                      </>
                    )}

                    {/* Others */}
                    {searchData.some((item) => !item.isPreviouslyShared) && (
                      <>
                        <li className="group-title">Others</li>
                        {searchData
                          .filter((item) => !item.isPreviouslyShared)
                          .map((item, index) => (
                            <li
                              key={`others-${index}`}
                              onClick={() => handleSearchSelect(item)}
                            >
                              <p>
                                {item.firstName} {item.lastName}
                              </p>
                              <p>@{item.username}</p>
                            </li>
                          ))}
                      </>
                    )}
                  </ul>
                )}
              </div>
              <button
                className="add-share-button"
                onClick={() => {
                  recordUserAction("Button click: Add share recipient");
                  handleAddShare(shareWith);
                }}
              >
                +
              </button>
            </div>
          </SectionErrorBoundary>

          {shareList.length > 0 && (
            <SectionErrorBoundary sectionName="ShareList">
              <div className="share-list">
                <div className="title">Sharing with:</div>
                {shareList.map((user, i) => (
                  <div className="user-container" key={i}>
                    <div className="user-content">
                      - <UserDisplayToggle userData={user.data} />
                    </div>
                    <div className="user-content-buttons">
                      <div
                        className="delete-user-btn"
                        onClick={() =>
                          handleDeleteUser(
                            user.data.publicAddress!
                          )
                        }
                      >
                        <RiDeleteBinLine size={20} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionErrorBoundary>
          )}
        </div>


        <TimeConditionSection
          useTimeCondition={useTimeCondition}
          setUseTimeCondition={setUseTimeCondition}
          timeConditionType={timeConditionType}
          setTimeConditionType={setTimeConditionType}
          timeValues={timeValues}
          setTimeValues={setTimeValues}
        />


        <div className="form-actions">
          <button className="clear-button" onClick={handleClear}>
            Clear Form
          </button>
          <button 
            className="save-button" 
            onClick={() => {
              recordUserAction("Button click: Save new data");
              encryptMessage();
            }}
            disabled={encrypting || !name.trim() || !message.trim() || shareWith.trim() !== ""}
            title={
              shareWith.trim() !== "" 
                ? "Please add or clear the pending share first"
                : !name.trim() || !message.trim()
                ? "Please fill in required fields (Title and Secret)"
                : ""
            }
          >
            {encrypting ? (
              <div className="encryption-progress">
                <div className="progress-spinner" />
                <div className="progress-text">
                  {encryptionStage === 'preparing' && 'Preparing...'}
                  {encryptionStage === 'encrypting' && 'Encrypting...'}
                  {encryptionStage === 'saving' && 'Saving...'}
                </div>
              </div>
            ) : (
              <>
                <MdLock size={18} />
                Encrypt & Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddData;
