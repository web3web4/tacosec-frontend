import { MetroSwal } from "./metroSwal";

export const showGDPR = () => {
  MetroSwal.fire({
    title: "GDPR & Privacy Policy",
    customClass: {
      popup: 'metro-swal-popup gdpr-popup',
      htmlContainer: 'metro-swal-content gdpr-content',
    },
    html: `
      <div style="text-align: left; max-height: 60vh; overflow-y: auto; padding-right: 10px;">
        <p><strong>Effective Date:</strong> ${new Date().toLocaleDateString()}</p>
        
        <h4>1. Introduction</h4>
        <p>Welcome to Taco. We value your privacy and are committed to protecting your personal data. This policy explains how we handle your information in compliance with GDPR.</p>
        
        <h4>2. Data We Collect</h4>
        <p>We collect and process the following minimal data:</p>
        <ul>
          <li><strong>Wallet Address:</strong> Used for authentication and identifying your account on the blockchain.</li>
          <li><strong>Encrypted Content:</strong> Secrets you create are encrypted on your device before being stored. We cannot decrypt or read them.</li>
          <li><strong>Telegram ID:</strong> If you use our Telegram bot, we store your ID to link your wallet.</li>
          <li><strong>Device Data:</strong> Encrypted seed phrases and preferences are stored locally in your browser's Local Storage.</li>
        </ul>

        <h4>3. How We Use Your Data</h4>
        <p>Your data is used strictly for:</p>
        <ul>
          <li>Facilitating secure secret sharing.</li>
          <li>Authenticating your access to the app.</li>
          <li>Managing your "Privacy Mode" settings.</li>
        </ul>

        <h4>4. Data Storage & Security</h4>
        <p>Your secrets are encrypted using client-side encryption. We do not have access to your private keys or the raw content of your secrets.</p>

        <h4>5. Your Rights</h4>
        <p>Under GDPR, you have the right to:</p>
        <ul>
          <li><strong>Access:</strong> View your stored data.</li>
          <li><strong>Rectification:</strong> Update your profile information.</li>
          <li><strong>Erasure:</strong> Delete your local data using the "Clear All Data" option in Settings.</li>
        </ul>

        <h4>6. Cookies & Local Storage</h4>
        <p>We use Local Storage to persist your session and encrypted keys. You can clear this at any time via browser settings or the app's "Clear All Data" button.</p>
        
        <h4>7. Contact Us</h4>
        <p>If you have questions about your data, please use the "Contact Support" button in Settings.</p>
      </div>
    `,
    width: '700px',
    confirmButtonText: "Close",
    showCloseButton: true,
  });
};
