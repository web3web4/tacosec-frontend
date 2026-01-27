import { formatAddress, getIdentifier, recordUserAction, copyToClipboard, getEncryptedSeed, sanitizePlainText } from "@/utils";
import { SectionErrorBoundary, OnboardingFlow, SheetModal } from "@/components";
// import { useNavigationGuard } from "@/context/NavigationGuardContext";
import { clearTokens } from "@/utils/cookieManager";
import { useWallet } from "@/wallet/walletContext";
import { MdDeleteForever, MdShield, MdContentCopy, MdLock, MdWarning, MdInfo } from "react-icons/md";
import { MetroSwal, showGDPR } from "@/utils";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import { ContactSupport } from "@/section";
import { noUserImage } from "@/assets";
import { useSetting } from "@/hooks";
import { useUser } from "@/context";
import "@/pages/Home/Home.css";
import "./Settings.css";


const Settings: React.FC = () => {
  const { profileImage, privacyModOn, handleTogglePrivacyMod, showSupportPopup, setShowSupportPopup, email, setEmail, phone, setPhone, firstName, setFirstName, lastName, setLastName, saveUserInfo, isSavingUserInfo, initialUserInfo, privacyUpdateStatus } = useSetting();
  const [showSeedFlow, setShowSeedFlow] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [emailError, setEmailError] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");
  const { address, addressweb } = useWallet();
  const { userData, isBrowser } = useUser();
  // const { setNavigationCheck } = useNavigationGuard();

  // Track if user info has been modified
  // const hasUnsavedChanges = () => {
  //   if (!isBrowser) return false;
  //   return (
  //     email !== initialUserInfo.email ||
  //     phone !== initialUserInfo.phone ||
  //     firstName !== initialUserInfo.firstName ||
  //     lastName !== initialUserInfo.lastName
  //   );
  // };

  // Setup navigation guard - temporarily disabled due to navigation blocking issues
  // useEffect(() => {
  //   const checkFunction = () => {
  //     if (!isBrowser) return false;
  //     return hasUnsavedChanges();
  //   };
  //   
  //   setNavigationCheck(checkFunction);
  //   
  //   return () => {
  //     setNavigationCheck(() => false);
  //   };
  // }, [email, phone, firstName, lastName, initialUserInfo, isBrowser, setNavigationCheck]);

  // Email validation
  const validateEmail = (value: string): boolean => {
    if (!value.trim()) {
      setEmailError("");
      return true;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Invalid email format");
      return false;
    }
    setEmailError("");
    return true;
  };

  // Phone validation
  const validatePhone = (value: string): boolean => {
    if (!value.trim()) {
      setPhoneError("");
      return true;
    }
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(value)) {
      setPhoneError("Invalid phone format");
      return false;
    }
    setPhoneError("");
    return true;
  };

  // Hide the "Copied" message after 2 seconds
  useEffect(() => {
    if (showCopied) {
      const timer = setTimeout(() => {
        setShowCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showCopied]);

  /**
   * Handles showing the seed phrase flow.
   * Checks if encrypted seed exists and shows the decrypt flow.
   */
  const handleShowSeedPhrase = () => {
    const identifier = getIdentifier(isBrowser, address, addressweb, userData?.user?.telegramId);
    if (!identifier) {
      MetroSwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Unable to identify wallet'
      });
      return;
    }
    const encrypted = getEncryptedSeed(identifier || "");
    if (!encrypted || encrypted === null) {
      MetroSwal.fire({
        icon: 'error',
        title: 'Error',
        text: "We couldn't find a saved seed on this device."
      });
      return;
    }
    MetroSwal.fire({
      icon: 'warning',
      title: 'Reveal Seed Phrase',
      html: `
        <div style="text-align:left; line-height:1.6;">
          <p style="margin-bottom: 8px; color: #cfcfcf;">Your seed phrase unlocks all your secrets and funds.</p>
          <ul style="margin:0; padding-left:18px; color:#cfcfcf;">
            <li>Ensure no one is watching your screen</li>
            <li>Never share or store it unencrypted</li>
            <li>Prefer offline backup in a secure location</li>
          </ul>
        </div>
      `,
      confirmButtonText: 'Reveal',
      cancelButtonText: 'Cancel',
      showCancelButton: true,
      allowOutsideClick: false,
      allowEscapeKey: true
    }).then(res => {
      if (res.isConfirmed) {
        setShowSeedFlow(true);
      }
    });
  };

  // Function to copy address to clipboard (simplified, no modal fallback)
  const copyAddressToClipboard = async () => {
    const addressToCopy = address || addressweb;
    if (!addressToCopy) return;
    
    try {
      await copyToClipboard(
        addressToCopy,
        () => setShowCopied(true),
        () => {
          // If clipboard API fails, show in MetroSwal
          MetroSwal.fire({
            icon: 'info',
            title: 'Copy Address',
            html: `<input type="text" value="${addressToCopy}" readonly style="width:100%; padding:8px; background:var(--surface); border:2px solid var(--border-color); color:var(--text-primary); font-family:monospace;" onfocus="this.select()" />`,
            confirmButtonText: 'Close'
          });
        }
      );
    } catch (err) {
      console.error("Failed to copy address: ", err);
    }
  };

  // Handle clear data functionality with progressive disclosure
  const handleClearData = () => {
    MetroSwal.fire({
      icon: "warning",
      title: '<span style="color: #ff5252;">⚠</span> DANGER ZONE',
      html: "This will permanently remove your wallet and all related data from this device. <strong>This action cannot be undone.</strong>",
      confirmButtonText: "I understand, continue",
      showCancelButton: true,
      cancelButtonText: "Cancel",
      customClass: {
        popup: 'danger-zone-popup',
        title: 'danger-zone-title',
        htmlContainer: 'danger-zone-content',
        confirmButton: 'danger-zone-confirm',
        cancelButton: 'danger-zone-cancel'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Second confirmation
        MetroSwal.fire({
          icon: "error",
          title: "Final Confirmation",
          html: "Are you absolutely sure? All your secrets and wallet data will be permanently deleted.",
          input: 'text',
          inputPlaceholder: 'Type DELETE to confirm',
          confirmButtonText: "Delete Everything",
          showCancelButton: true,
          cancelButtonText: "Cancel",
          customClass: {
            popup: 'danger-zone-popup',
            title: 'danger-zone-title',
            htmlContainer: 'danger-zone-content',
            confirmButton: 'danger-zone-confirm-final',
            cancelButton: 'danger-zone-cancel'
          },
          preConfirm: (inputValue) => {
            if (inputValue !== 'DELETE') {
              Swal.showValidationMessage('Please type DELETE to confirm');
              return false;
            }
            return true;
          }
        }).then((finalResult) => {
          if (finalResult.isConfirmed) {
            // Delete the specified localStorage items
            Object.keys(localStorage).forEach((key) => {
              if (
                key.startsWith("seedBackupDone-") ||
                key.startsWith("encryptedSeed-") ||
                key === "savePasswordInBackend" ||
                key === "publicAddress"
              ) {
                localStorage.removeItem(key);
              }
            });

            // For web users: clear auth cookies (access_token, refresh_token)
            if (isBrowser) {
              try {
                clearTokens();
              } catch (err) {
                console.error("Failed to clear auth tokens:", err);
              }
            }

            // Reload the page to reflect changes
            window.location.reload();
          }
        });
      }
    });
  };

  return (
    <>
      <div className="settings-container">
        <h2 className="page-title">Settings</h2>
        
        <SectionErrorBoundary sectionName="ProfileSection">
          <div className="profile-section">
            <div className="photo-preview">
              <img
                src={profileImage || noUserImage}
                alt="Profile"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = noUserImage;
                }}
              />
            </div>
            <div className="profile-name">
              {userData?.user?.firstName} {userData?.user?.lastName}
            </div>
            <div 
              className="address-container clickable" 
              onClick={() => {
                recordUserAction("Button click: Copy wallet address");
                copyAddressToClipboard();
              }}
              title="Click to copy full address"
              aria-live="polite" 
              aria-atomic="true"
            >
              <span>Address: </span>
              <span className="address-value">{formatAddress(4, address || addressweb || undefined)}</span>
              <MdContentCopy className="copy-icon" />
              {showCopied && <span className="copied-message">✓ Copied!</span>}
            </div>
            <p className="field-helper">Click address to copy</p>
          </div>
        </SectionErrorBoundary>

        <div className="form-divider" />

        <h3 className="section-title">
          <MdShield style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Security & Privacy
        </h3>
        <div className="privacy-section-card">
          <div className="checkbox-row">
            <span className="privacy-label">
              Max privacy mode
              <span
                className={`security-badge ${privacyModOn ? "on" : "off"}`}
                aria-live="polite"
              >
                {privacyModOn ? (
                  <>
                    <MdShield style={{ marginRight: 4 }} /> MAX
                  </>
                ) : (
                  "Standard"
                )}
              </span>
            </span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={privacyModOn}
                onChange={handleTogglePrivacyMod}
                disabled={privacyUpdateStatus === 'updating'}
              />
              <span className="slider round"></span>
            </label>
          </div>
          {privacyUpdateStatus && (
            <div className={`privacy-feedback ${privacyUpdateStatus}`}>
              {privacyUpdateStatus === 'updating' && (
                <><span className="spinner-small" /> Updating...</>
              )}
              {privacyUpdateStatus === 'success' && (
                <>✓ Privacy mode {privacyModOn ? 'enabled' : 'disabled'}</>
              )}
            </div>
          )}
          <p className="field-helper" style={{ marginTop: '0.5rem' }}>
            <MdInfo style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            Whether to save and your view timestamps, and other metadata alike.
          </p>
        </div>

        {/* Browser-only user info fields with validation */}
        {isBrowser && (
          <>
            <div className="form-divider" />
            
            <div className="user-info-section">
              <div className="section-header">
                <h3 className="section-title">Contact & Identity</h3>
                <p className="section-subtitle">
                  Browser-Only Information (Not shared with Telegram)
                </p>
              </div>
              
              <div className="input-grid">
                <div className="input-row">
                  <label>Email address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      const sanitized = sanitizePlainText(e.target.value, { maxLength: 128 });
                      setEmail(sanitized);
                      validateEmail(sanitized);
                    }}
                    onBlur={(e) => validateEmail(e.target.value)}
                    className={emailError ? 'input-error' : ''}
                  />
                  {emailError && (
                    <span className="validation-error">
                      <MdWarning size={14} /> {emailError}
                    </span>
                  )}
                </div>

                <div className="input-row">
                  <label>Phone number</label>
                  <input
                    type="tel"
                    placeholder="+1234567890"
                    value={phone}
                    onChange={(e) => {
                      const sanitized = sanitizePlainText(e.target.value, { maxLength: 20 });
                      setPhone(sanitized);
                      validatePhone(sanitized);
                    }}
                    onBlur={(e) => validatePhone(e.target.value)}
                    className={phoneError ? 'input-error' : ''}
                  />
                  {phoneError && (
                    <span className="validation-error">
                      <MdWarning size={14} /> {phoneError}
                    </span>
                  )}
                </div>

                <div className="input-row">
                  <label>First name</label>
                  <input
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(sanitizePlainText(e.target.value, { maxLength: 50 }))}
                  />
                </div>

                <div className="input-row">
                  <label>Last name</label>
                  <input
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(sanitizePlainText(e.target.value, { maxLength: 50 }))}
                  />
                </div>
              </div>

              {/* Temporarily disabled unsaved changes warning
              {hasUnsavedChanges() && (
                <div className="unsaved-changes-warning">
                  <MdWarning size={16} /> You have unsaved changes
                </div>
              )}
              */}

              <button
                className="seed-button"
                onClick={() => {
                  if (!emailError && !phoneError) {
                    recordUserAction("Button click: Save user info");
                    saveUserInfo();
                  }
                }}
                disabled={isSavingUserInfo || !!emailError || !!phoneError}
                title={emailError || phoneError ? "Fix validation errors first" : "Save user information"}
              >
                {isSavingUserInfo ? "Saving..." : "Save"}
              </button>
            </div>
          </>
        )}

        <div className="form-divider" />

        <h3 className="section-title">
          <MdLock style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Wallet Management
        </h3>
        <div className="seed-section">
          <button className="seed-button" onClick={() => {
            recordUserAction("Button click: View seed phrase");
            handleShowSeedPhrase();
          }}>
            <MdLock style={{ marginRight: 6 }} /> Show Seed Phrase
          </button>
          <p className="field-helper" style={{ marginTop: '0.5rem' }}>
            Reveals your recovery phrase (requires password)
          </p>
        </div>

        <div className="form-divider" style={{ margin: '2rem 0' }} />

        {/* Danger Zone */}
        <div className="danger-zone">
          <h3 className="danger-zone-title">
            <MdWarning style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Danger Zone
          </h3>
          <div className="danger-zone-content">
            <div className="danger-zone-item">
              <div className="danger-zone-description">
                <strong>Delete All Data</strong>
                <p>Permanently removes your wallet and all secrets from this device</p>
              </div>
              <button
                className="danger-button"
                onClick={() => {
                  recordUserAction("Button click: Clear wallet data");
                  handleClearData();
                }}
              >
                <MdDeleteForever style={{ marginRight: '4px' }} />
                Delete
              </button>
            </div>
          </div>
        </div>

        <SectionErrorBoundary sectionName="SupportSection">
          <h3 className="section-title">Support</h3>
          <div className="support-section">
            <button className="support-button" onClick={() => {
              recordUserAction("Button click: Contact support");
              setShowSupportPopup(true);
            }}>Contact Support</button>
            <button
              className="support-button"
              style={{ marginTop: '10px' }}
              onClick={() => {
                recordUserAction("Button click: View GDPR");
                showGDPR();
              }}
            >
              Privacy & GDPR
            </button>
          </div>
        </SectionErrorBoundary>

      </div>

      {showSeedFlow && (
        <OnboardingFlow
          initialStep="decrypt"
          onComplete={() => setShowSeedFlow(false)}
          viewSeedOnly={true}
          viewBack={false}
        />
      )}

      <SheetModal open={showSupportPopup} onClose={setShowSupportPopup} title="Contact Support">
        <SectionErrorBoundary sectionName="ContactSupport">
          <ContactSupport setShowSupportPopup={setShowSupportPopup} />
        </SectionErrorBoundary>
      </SheetModal>
    </>
  );
};

export default Settings;
