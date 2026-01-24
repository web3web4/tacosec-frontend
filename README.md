<p align="center">
  <img src="public/logo512.png" width="128" alt="TACoSec Logo" />
</p>

# TACoSec

**Secret Stashing and Sharing** — A secure utility for managing sensitive data with cryptographic privacy and intuitive UX. Built with React and TypeScript, leveraging NuCypher TACo (Threshold Access Control) for decentralized end-to-end encryption.

> **Frontend Repository** (you are here) | [Backend Repository](https://github.com/web3web4/tacosec-backend)

## Access & Deployments

### Production
The stable, primary distribution of TACoSec.
- **Telegram Mini App**: [@tacosec_bot](https://t.me/tacosec_bot)
- **Web Application**: [app.tacosec.com](https://app.tacosec.com)

---

### Staging
Used for internal testing and validation of upcoming features.
- **Telegram Mini App**: [@taco_sec_staging_bot](https://t.me/taco_sec_staging_bot)
- **Web Application**: [staging.tacosec.com](https://staging.tacosec.com)

> [!NOTE]
> **Legacy Version**: An earlier MVP using Telegram-only authentication is available at [@tacosec_v1_bot](https://t.me/tacosec_v1_bot). This version has been superseded by the current wallet-signature authentication.

## About

TACoSec combines **security-first architecture** with **user-friendly design** for stashing and sharing sensitive information (passwords, API keys, credentials). Built on NuCypher TACo (Threshold Access Control), secrets are encrypted client-side with threshold cryptography — only recipients whom you specify can decrypt, ensuring **privacy**.


## Built With

[![TACo](https://img.shields.io/badge/Powered%20by-TACo-95FF5D)](https://taco.build)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![ethers.js](https://img.shields.io/badge/ethers.js-2535a0?logo=ethereum&logoColor=white)](https://docs.ethers.org/)
[![Telegram](https://img.shields.io/badge/Telegram-Mini%20App-26A5E4?logo=telegram)](https://core.telegram.org/bots/webapps)


## Features

### Core Capabilities

- **🔐 Cryptographic Privacy**: Secrets encrypted using NuCypher TACo threshold encryption—only authorized recipients can decrypt
- **� Secret Stashing**: Securely store sensitive data with client-side encryption
- **👥 Flexible Sharing**: Share secrets based on Ethereum addresses or Telegram usernames (linked with Ethereum address).
- **🔑 Access Conditions**:
  - **Time-Based**: Set unlock times (future access) or expiration times (automatic revocation)
  - **AddressAllowList**: Restrict decryption to specific Ethereum addresses
- **💬 Encrypted Replies**: Recipients can respond with secure, encrypted secrets
- **📊 Audit Trail**: Track access history with secret's view statistics
- **👤 Max Privacy Mode**: Prevents storage of creation timestamps, view counts, and metadata — notifications become generic for minimal footprint

### Security & Privacy

- **End-to-End Encryption**: Backend has no access to your secrets — true cryptographic privacy
- **Wallet-Signature Authentication**: All users authenticate via Ethereum wallet signatures
- **Telegram Integration**: Leverages the Telegram ecosystem for seamless username-based sharing and smoother, more intuitive user experience
- **Client-Side Encryption**: All secrets encrypted locally before transmission
- **Secure Storage**: Wallet seeds encrypted with your password, stored locally only

## How It Works

TACoSec uses **threshold cryptography** to ensure your secrets remain private:

🛡️ **Your data is encrypted client-side. Decryption requires threshold consensus from independent nodes — no single party can access your secrets.**

**Technical Architecture:**

- **Protocol**: Ferveo (threshold encryption)
- **Cryptography**: BLS12-381 elliptic curves
- **Decryption**: Multi-party computation (MPC) via decentralized node cohort
- **Access Control**: NuCypher TACo conditions (time-based, address-based)
- **Zero Trust**: Backend stores only encrypted data, cannot access plaintext

## Installation

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd tacosec-frontend
   pnpm install
   ```

2. **Configure environment**
   ```bash
   cp .env-example .env
   ```
   
All variables must be prefixed with `REACT_APP_`.

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_WALLET_ENCRYPTION_PEPPER` | Application identifier for wallet encryption | `tacosec_v1` |
| `REACT_APP_TACO_DOMAIN` | NuCypher TACo domain | `tapir` (testnet) |
| `REACT_APP_TACO_RITUAL_ID` | TACo ritual ID | `6` |
| `REACT_APP_RPC_PROVIDER_URL` | Ethereum RPC endpoint | `https://rpc-amoy.polygon.technology` |
| `REACT_APP_API_BASE_URL` | Backend API URL | `https://api.tacosec.com` |
| `REACT_APP_BOT_USER_NAME` | Telegram bot username | `@tacosec_bot` |
| `REACT_APP_OPENREPLAY_PROJECT_KEY` | Analytics key (optional) | — |

3. **Start development server**
   ```bash
   pnpm start
   ```
   Open `http://localhost:3000`

## Usage

### Common Workflows

#### Stashing a Secret

1. Navigate to "Save New Encrypted Secret"
2. Enter a descriptive title and your secret text
3. Select recipients (search by Ethereum address or Telegram username)
4. Configure access conditions:
   - **Time-Based**: Set unlock time or expiration time
   - **AddressAllowList**: Optionally grant access to specific Ethereum addresses
5. Click "Encrypt & Save" — encryption happens instantly on your device

#### Viewing Received Secrets

1. Navigate to "Home" → "Received Secrets"
2. Click secret to decrypt
3. Enter wallet password if prompted
4. View content and optionally reply

#### Managing Your Secrets

1. Navigate to "Home" → "My Secrets"
2. Expand secret to view:
   - Content
   - View statistics
   - Recipient list
   - Replies
3. Delete or hide as needed

## Contributing

Contributions are welcome! Fork the repo, make your improvements, and submit a pull request. We appreciate your help making TACoSec better.


## License

MIT License — see `package.json` for details.

---

## Powered By

🔐 **[NuCypher TACo (Threshold Access Control)](https://taco.build)** — Decentralized threshold encryption & access control  
⚡ **[React](https://react.dev/)** — UI framework  
🔑 **[ethers.js](https://docs.ethers.org/)** — Wallet management & blockchain interaction  
💬 **[Telegram Mini Apps](https://core.telegram.org/bots/webapps)** — In-chat application platform

### Authentication

All users authenticate via **Ethereum wallet signatures**. Telegram Mini App integration enhances user experience by enabling username-based sharing with invited users, while maintaining wallet-signature security for data access.

---

**TACoSec** • [Frontend](https://github.com/web3web4/tacosec-frontend) (you are here) • [Backend](https://github.com/web3web4/tacosec-backend) • *Powered by [TACo](https://taco.build) 💚* • **Built with ❤️ by [Web3Web4](https://web3web4.com)**