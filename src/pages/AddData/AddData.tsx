import { noUserImage, deleteIcon } from "@/assets";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { conditions, toHexString } from "@nucypher-experimental2/taco";
import { storageEncryptedData } from "@/apiService";
import { useWallet } from "@/wallet/walletContext";
import { parseTelegramInitData, showError, createAppError, formatAddress } from "@/utils";
import { MetroSwal } from "@/utils/metroSwal";
import { useAddData, useTaco } from "@/hooks";
import { CustomPopup, SectionErrorBoundary, TelegramInviteButton } from "@/components";
import React, { useState } from "react";
import { useUser } from "@/context";
import "./AddData.css";
import { DataPayload } from "@/interfaces/addData";

const ritualId = process.env.REACT_APP_TACO_RITUAL_ID as unknown as number;
const domain = process.env.REACT_APP_TACO_DOMAIN as string;
const BOT_USER_NAME = process.env.REACT_APP_BOT_USER_NAME as string;

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
    handleDeleteUsername,
    handleAddShare,
    cleanFields,
    checkEncrypting,
    setMessage,
    setName,
  } = useAddData();

  const [encrypting, setEncrypting] = useState(false);
  const [seconds, setSeconds] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [months, setMonths] = useState<number>(0);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
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

    setEncrypting(true);
    try {
      if (!signer) {
        console.error("Signer not found", signer);
        return;
      }

      let publicAddresses: string[] = [];
      publicAddresses.push(address!);
      shareList
        .filter((item) => item.data.publicAddress !== null)
        .map((item) => publicAddresses.push(item.data.publicAddress!));

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
      const secondsToAdd = Number(seconds) || 0;
      const minutesToAdd = (Number(minutes) || 0) * 60;
      const hoursToAdd = (Number(hours) || 0) * 60 * 60;
      const monthsToAdd = (Number(months) || 0) * 30 * 24 * 60 * 60; // Approximate months as 30 days

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
      const encryptedBytes = await encryptDataToBytes(
        message,
        compoundCondition,
        signer!
      );

      if (encryptedBytes) {
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
          key: name,
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
          MetroSwal.success(
            "All set",
            "Your data was encrypted and saved securely."
          );

          cleanFields();
          // Reset time period inputs
          setSeconds(0);
          setMinutes(0);
          setHours(0);
          setMonths(0);
          setShowMoreOptions(false);
        }
      }
    } catch (e: unknown) {
      const appError = createAppError(e, "unknown");
      showError(appError, "Error");
    }
    setEncrypting(false);
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
                <button onClick={() => handleConfirmClick(userProfile.data)}>
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
        <h2 className="page-title">Add New Data</h2>
        <label>Title</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Facebook Password"
          className="input-field"
        />

        <label>Secret</label>
        <textarea
          placeholder="New Data ..."
          className="input-field-textarea"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <div className="checkbox-time-condition">
          <label>
            <input
              type="checkbox"
              checked={useTimeCondition}
              onChange={(e) => setUseTimeCondition(e.target.checked)}
            />
            Do you want to add a date/time condition to unlock this secret?
          </label>
        </div>
        {useTimeCondition && (
          <>
            <div className="time-condition-type">
              <label>
                <input
                  type="radio"
                  value="unlock"
                  checked={timeConditionType === "unlock"}
                  onChange={() => setTimeConditionType("unlock")}
                />
                Unlock after specific time
              </label>
              <label>
                <input
                  type="radio"
                  value="expire"
                  checked={timeConditionType === "expire"}
                  onChange={() => setTimeConditionType("expire")}
                />
                Expire after specific time
              </label>
            </div>
            <div className="more-options-section">
              <button
                className="more-options-toggle"
                onClick={() => setShowMoreOptions(!showMoreOptions)}
              >
                <span>
                  Time Period{" "}
                  {showMoreOptions ? <FiChevronUp /> : <FiChevronDown />}
                </span>
              </button>

              {showMoreOptions && (
                <div className="more-options-content">
                  <p className="more-options-description">
                    Set when your secret will be unlocked. Enter values in
                    seconds, minutes, hours, or months.
                  </p>
                  <div className="time-period-container">
                    <div className="time-input-group">
                      <input
                        type="number"
                        min="0"
                        value={seconds}
                        onChange={(e) =>
                          setSeconds(parseInt(e.target.value) || 0)
                        }
                        className="time-input"
                      />
                      <label className="time-label">Seconds</label>
                    </div>
                    <div className="time-input-group">
                      <input
                        type="number"
                        min="0"
                        value={minutes}
                        onChange={(e) =>
                          setMinutes(parseInt(e.target.value) || 0)
                        }
                        className="time-input"
                      />
                      <label className="time-label">Minutes</label>
                    </div>
                    <div className="time-input-group">
                      <input
                        type="number"
                        min="0"
                        value={hours}
                        onChange={(e) =>
                          setHours(parseInt(e.target.value) || 0)
                        }
                        className="time-input"
                      />
                      <label className="time-label">Hours</label>
                    </div>
                    <div className="time-input-group">
                      <input
                        type="number"
                        min="0"
                        value={months}
                        onChange={(e) =>
                          setMonths(parseInt(e.target.value) || 0)
                        }
                        className="time-input"
                      />
                      <label className="time-label">Months</label>
                    </div>
                  </div>
                  {seconds > 0 || minutes > 0 || hours > 0 || months > 0 ? (
                    <div className="time-summary">
                      Unlocks after:{" "}
                      {months > 0
                        ? `${months} month${months !== 1 ? "s" : ""} `
                        : ""}
                      {hours > 0
                        ? `${hours} hour${hours !== 1 ? "s" : ""} `
                        : ""}
                      {minutes > 0
                        ? `${minutes} minute${minutes !== 1 ? "s" : ""} `
                        : ""}
                      {seconds > 0
                        ? `${seconds} second${seconds !== 1 ? "s" : ""}`
                        : ""}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </>
        )}

        {encrypting && (
          <div
            style={{
              marginTop: "5px",
              color: "var(--danger)",
              fontWeight: "bold",
            }}
          >
            Encrypting your secret...
          </div>
        )}
        <label>Share with (optional)</label>
        <SectionErrorBoundary sectionName="ShareWithSection">
          <div className="share-with-row">
            <div className="autocomplete-wrapper">
              <div className="input-wrapper">
                <input
                  type="text"
                  value={shareWith}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="@username or address"
                  className="input-field"
                />
                {isSearch && <span className="spinner" />}
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
              onClick={() => handleAddShare(shareWith)}
            >
              +
            </button>
          </div>
        </SectionErrorBoundary>

        {shareList.length > 0 && (
          <SectionErrorBoundary sectionName="ShareList">
            <div className="share-list">
              <p>Sharing with:</p>
              {shareList.map((user, i) => (
                <div className="user_container" key={i}>
                  <div>
                    -{" "}
                    {user.data.username
                      ? `@${user.data.username}`
                      : formatAddress(10, user.data.publicAddress!)}
                  </div>
                  <div className="user-content-buttons">
                    <div
                      className="delete-user-btn"
                      onClick={() =>
                        handleDeleteUsername(
                          user.data.username || user.data.publicAddress!
                        )
                      }
                    >
                      <img
                        src={deleteIcon}
                        alt="delete icon"
                        width={20}
                        height={20}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionErrorBoundary>
        )}

        <button className="save-button" onClick={encryptMessage}>
          Save
        </button>
      </div>
    </div>
  );
};

export default AddData;
