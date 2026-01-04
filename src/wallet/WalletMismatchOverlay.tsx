import React from "react";
import { formatAddress } from "@/utils";
import { MdWarning, MdContentCopy, MdDeleteForever } from "react-icons/md";
import "./WalletMismatchOverlay.css";

interface WalletMismatchOverlayProps {
    currentAddress: string;
    activeAddress: string;
    onBackup: () => void;
    onClearData: () => void;
}

const WalletMismatchOverlay: React.FC<WalletMismatchOverlayProps> = ({
    currentAddress,
    activeAddress,
    onBackup,
    onClearData,
}) => {
    return (
        <div className="wallet-mismatch-overlay">
            <div className="onboarding-screen">
                <div className="onboarding-header">
                    <h1>
                        <MdWarning />
                        Wallet Mismatch
                    </h1>
                    <p>
                        Another wallet has been linked to this Telegram account. You cannot use more than one address for the same account, and only the last one linked is active.
                    </p>
                </div>

                <div className="onboarding-content">
                    <div className="mismatch-address-section">
                        <div className="mismatch-address-box active">
                            <span className="address-label">Active Address</span>
                            <span className="address-value">{formatAddress(8, activeAddress)}</span>
                        </div>

                        <div className="mismatch-address-box current">
                            <span className="address-label">Your Current Address</span>
                            <span className="address-value">{formatAddress(8, currentAddress)}</span>
                        </div>
                    </div>
                </div>

                <div className="onboarding-actions">
                    <button className="onboarding-btn primary" onClick={onBackup}>
                        <MdContentCopy />
                        Backup Current Seed
                    </button>
                    <button className="onboarding-btn danger" onClick={onClearData}>
                        <MdDeleteForever />
                        Reset & Re-setup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WalletMismatchOverlay;
