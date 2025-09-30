import { MdLock, MdLockOpen, MdExpandMore, MdExpandLess, MdRestorePage } from "react-icons/md";
import { getPublicAddresses } from "@/apiService";
import { useState, useEffect } from "react";
import { useUser } from "@/context";
import { MetroSwal } from "@/utils";
import "./SeedPhrase.css";

// ------------------------------
// 🔹 Helper function to retrieve the last secret
// ------------------------------
async function fetchLatestSecret(initDataRaw: string | null): Promise<string | null> {
  const response = await getPublicAddresses(initDataRaw);
  console.log("API Response:", response);

  if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
    // Filter elements containing secret
    const withSecrets = response.data.filter(
      (item: { secret?: string }) => !!item.secret
    );

    if (withSecrets.length > 0) {
      // Sort them by most recent
      const sortedAddresses = withSecrets.sort(
        (a: { createdAt: string }, b: { createdAt: string }) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const latestAddress = sortedAddresses[0];
      console.log("Latest address with secret:", latestAddress);
      return latestAddress.secret!;
    }
  }

  return null;
}

type Props = {
  password: string;
  passwordError: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  onForgotPassword: () => void;
  onHidePrompt?: (show?: boolean) => void;
};

export const DecryptPrompt = ({
  password,
  passwordError,
  onChange,
  onSubmit,
  onForgotPassword,
  onHidePrompt,
}: Props) => {
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [canRestoreFromServer, setCanRestoreFromServer] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState("");
  const { initDataRaw } = useUser();

  useEffect(() => {
    const savePasswordInBackend = localStorage.getItem("savePasswordInBackend");
    setCanRestoreFromServer(savePasswordInBackend === "true");
  }, []);

  // ------------------------------
  // 🔹 Restore password button
  // ------------------------------
  const handleRestorePassword = async () => {
    try {
      setIsRestoring(true);
      setRestoreError("");

      const latestSecret = await fetchLatestSecret(initDataRaw);

      if (latestSecret) {
        onChange(latestSecret);
        MetroSwal.fire("✅ Success", "Password restored successfully", "success");
        //onSubmit();
      } else {
        setRestoreError("No password found");
      }
    } catch (error) {
      setRestoreError(error instanceof Error ? error.message : "Failed to restore password");
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="popup-container-seed">
      <div className="popup-seed">
        <h2>
          <MdLock style={{ marginRight: "8px", verticalAlign: "middle" }} />
          Decrypt Your Wallet
        </h2>
        <p>Enter your password to continue:</p>
        <input
          type="password"
          placeholder="Your encryption password"
          value={password}
          onChange={(e) => onChange(e.target.value)}
          className="input-field"
        />
        {passwordError && <p style={{ color: "red", marginTop: 10 }}>{passwordError}</p>}
        <div className="popup-actions">
          <button className="confirm-btn" onClick={onSubmit}>
            <MdLockOpen style={{ marginRight: "4px", verticalAlign: "middle" }} />
            Unlock
          </button>

          <p
            className="forgot-password"
            onClick={onForgotPassword}
            style={{
              cursor: "pointer",
              marginTop: 12,
              color: "#4CAF50",
              textAlign: "center",
              textDecoration: "underline",
            }}
          >
            Forgot password?
          </p>

          {/* More options section */}
          {canRestoreFromServer && (
            <div style={{ marginTop: "15px", textAlign: "center" }}>
              <div
                onClick={() => setShowMoreOptions(!showMoreOptions)}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#666",
                }}
              >
                {showMoreOptions ? <MdExpandLess /> : <MdExpandMore />}
                <span style={{ marginLeft: "5px" }}>More options</span>
              </div>

              {showMoreOptions && (
                <div
                  style={{
                    marginTop: "15px",
                    padding: "10px",
                    border: "1px solid #eee",
                    borderRadius: "5px",
                  }}
                >
                  <p style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>
                    You can restore password from server
                  </p>
                  {restoreError && (
                    <p style={{ color: "red", marginTop: 10, fontSize: "12px" }}>{restoreError}</p>
                  )}
                  <button className="confirm-btn" onClick={handleRestorePassword} disabled={isRestoring}>
                    <MdRestorePage style={{ marginRight: "4px", verticalAlign: "middle" }} />
                    {isRestoring ? "Restoring..." : "Restore Password"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
