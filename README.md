# TACoSec Frontend

A secure, decentralized secret sharing platform built with React and TypeScript, leveraging NuCypher's Threshold Access Control Objects (TACo) for end-to-end encryption. TACoSec enables users to securely share passwords, API keys, and other sensitive data with granular access control and time-based conditions.

## Project Description

TACoSec is a web application that provides a secure way to share sensitive information (passwords, API keys, credentials) with others using threshold cryptography. The platform uses NuCypher TACo technology to encrypt secrets that can only be decrypted by authorized recipients, ensuring that even the platform itself cannot access the shared data.

## Built With

[![TACo](https://img.shields.io/badge/Powered%20by-TACo-95FF5D)](https://taco.build)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![ethers.js](https://img.shields.io/badge/ethers.js-2535a0?logo=ethereum&logoColor=white)](https://docs.ethers.org/)
[![Telegram](https://img.shields.io/badge/Telegram-Mini%20App-26A5E4?logo=telegram)](https://core.telegram.org/bots/webapps)

### Main Purpose

- **Secure Secret Sharing**: Share passwords and sensitive data with specific users using threshold encryption
- **Access Control**: Define who can decrypt your secrets using blockchain-based public addresses
- **Time-Based Conditions**: Set unlock and expiration times for shared secrets
- **Multi-Platform Support**: Works both as a Telegram Mini App and standalone web application
- **Admin Dashboard**: Comprehensive admin panel for user, secret, and report management

### Target Audience

- Individuals and teams who need to securely share credentials
- Organizations requiring granular access control for sensitive information
- Users who want decentralized, trustless secret sharing
- Developers and security-conscious and decentralization users

## Features

### Core Features

- **🔐 Threshold Encryption**: Secrets are encrypted using NuCypher TACo, ensuring only authorized recipients can decrypt
- **👥 Multi-User Sharing**: Share secrets with multiple users simultaneously using their public addresses
- **⏰ Time-Based Access Control**: 
  - Set unlock times (secrets become accessible at a future date)
  - Set expiration times (secrets become inaccessible after a certain date)
- **💬 Reply System**: Recipients can reply to shared secrets with encrypted child secrets
- **📊 View Statistics**: Track who viewed your secrets and when
- **🔔 Alerts & Notifications**: Get notified when secrets are shared with you or reports are filed
- **👤 Privacy Mode**: Control visibility of your profile information
- **📱 Telegram Integration**: Native Telegram Mini App support with seamless authentication by initData
- **🌐 Web Support**: Standalone web application with JWT authentication
- **🌐Wallet Internal Support**

### Security Features

- **Wallet-Based Authentication**: Ethereum wallet signature authentication for web users
- **Encrypted Seed Storage**: Wallet seeds are encrypted and stored locally
- **Password Management**: Optional password storage with server-side encryption
- **Report System**: Report inappropriate content or security issues
- **Access Logging**: Comprehensive logging of user actions and secret access
- **Max privacy mode**: hide any information with you.

### Admin Features

- **User Management**: View, manage, and moderate users
- **Secret Management**: Monitor all secrets in the system
- **Report Management**: Review and resolve user reports
- **Notification Management**: View system notifications
- **Activity Logging**: Monitor user actions and system events
- **Statistics Dashboard**: View platform-wide statistics

## Technical Overview

TACoSec follows a component-based React architecture with clear separation of concerns using Context API for state management, service layers for API communication, custom hooks for business logic, and a structured component hierarchy.

## Tech Stack

### Core Technologies

- **React**: `^19.1.0` - UI framework
- **TypeScript**: `^5.8.3` - Type safety
- **React Router**: `^7.5.0` - Client-side routing
- **Ethers.js**: `^5.7.2` - Ethereum wallet and blockchain interaction

### Encryption & Security

- **@nucypher/taco**: `0.7.0-alpha.5` - Threshold Access Control Objects
- **@nucypher/taco-auth**: `0.4.0-alpha.5` - TACo authentication
- **@nucypher/shared**: `0.6.0-alpha.5` - Shared NuCypher utilities
- **crypto-js**: `^4.2.0` - Additional cryptographic functions
- **crypto-browserify**: `^3.12.1` - Node.js crypto polyfill for browser

### UI Libraries

- **Material-UI (MUI)**: `^7.3.2` - Component library
- **@mui/x-date-pickers**: `^8.11.0` - Date/time pickers
- **@emotion/react**: `^11.14.0` - CSS-in-JS styling
- **@emotion/styled**: `^11.14.1` - Styled components
- **styled-components**: `^6.1.17` - Additional styling
- **react-icons**: `^5.5.0` - Icon library
- **sweetalert2**: `^11.19.1` - Alert dialogs

### Build Tools

- **Create React App**: `5.0.1` - React application scaffolding
- **@craco/craco**: `^7.1.0` - Create React App Configuration Override
- **TypeScript ESLint**: `^5.62.0` - Linting and type checking

### Utilities

- **date-fns**: `^4.1.0` - Date manipulation
- **uuid**: `^11.1.0` - Unique identifier generation
- **js-cookie**: `^3.0.5` - Cookie management
- **buffer**: `^6.0.3` - Buffer polyfill
- **process**: `^0.11.10` - Process polyfill
- **stream-browserify**: `^3.0.0` - Stream polyfill

### Analytics & Monitoring

- **@openreplay/tracker**: `^16.4.8` - Session replay and analytics
- **web-vitals**: `^2.1.4` - Web performance metrics

### Testing

- **@testing-library/react**: `^16.3.0` - React testing utilities
- **@testing-library/jest-dom**: `^6.6.3` - Jest DOM matchers
- **@testing-library/user-event**: `^13.5.0` - User interaction simulation

## Installation

### Prerequisites

- **Node.js**: Version 18.x or higher
- **Yarn**: Package manager
- **Git**: Version control

### Step-by-Step Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taco-front
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env-example .env
   ```
   
   Edit `.env` and configure the following variables:
   ```env
   REACT_APP_TG_SECRET_SALT=your_telegram_secret_salt
   REACT_APP_TACO_DOMAIN=tapir //for testnet network
   REACT_APP_TACO_RITUAL_ID=6 //for test
   REACT_APP_RPC_PROVIDER_URL=https://rpc-amoy.polygon.technology
   REACT_APP_API_BASE_URL=https://your-backend-api-url.com
   REACT_APP_BOT_USER_NAME=@YourTelegramBot
   REACT_APP_OPENREPLAY_PROJECT_KEY=your_openreplay_key
   ```

4. **Start the development server**
   ```bash
   yarn start
   ```
5. **Open your browser**
   - The application will automatically open at `http://localhost:3000`
   - For Telegram Mini App testing, use Telegram's WebApp environment

## Configuration

### Environment Variables

All environment variables must be prefixed with `REACT_APP_` to be accessible in the React application.

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_TG_SECRET_SALT` | Salt for encrypting Telegram user passwords | `your_secret_salt_string` |
| `REACT_APP_TACO_DOMAIN` | NuCypher TACo domain name | e.g. `tapir` (testnet) |
| `REACT_APP_TACO_RITUAL_ID` | TACo ritual ID for encryption | e.g. `6` |
| `REACT_APP_RPC_PROVIDER_URL` | Ethereum RPC provider URL | e.g. `https://rpc-amoy.polygon.technology` |
| `REACT_APP_API_BASE_URL` | Backend API base URL | e.g. `https://api.tacosec.com` |
| `REACT_APP_BOT_USER_NAME` | Telegram bot username | e.g. `@@tacosec_bot` (live) or `@Taco_Sec_Staging_bot` (staging) |

#### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_OPENREPLAY_PROJECT_KEY` | OpenReplay analytics project key | Empty (analytics disabled) |

### Webpack Configuration

The project uses CRACO to customize webpack configuration for crypto polyfills. The configuration in `craco.config.js`:

- Adds polyfills for `buffer`, `crypto`, `stream`, and `process`
- Configures path aliases (`@/*` → `src/*`)
- Handles ESM module resolution for NuCypher packages

### TypeScript Configuration

TypeScript is configured with:
- Strict mode enabled
- Path aliases for cleaner imports (`@/components`, `@/utils`, etc.)
- React JSX transform
- ES5 target with modern lib support

## Usage

### Running the Application

#### Development Mode
```bash
yarn start
```
Starts the development server with hot-reload at `http://localhost:3000`

#### Production Build
```bash
yarn build
```
Creates an optimized production build in the `build/` directory

#### Running Tests
```bash
yarn test
```
Launches the test runner in interactive watch mode

### Common User Workflows

#### 1. Creating a Secret

1. Navigate to the "Add Data" page
2. Enter a title/name for your secret
3. Enter the secret value (password, API key, etc.)
4. Search and select users to share with
5. (Optional) Set time-based conditions:
   - Unlock time: Secret becomes accessible at a future date
   - Expiration time: Secret becomes inaccessible after a date
6. Click "Encrypt and Save"
7. Wait for encryption to complete (uses TACo threshold encryption)

#### 2. Viewing Shared Secrets

1. Navigate to "Home" page
2. Switch to "Shared with Me" tab
3. Click on a secret to expand and decrypt
4. Enter wallet password if prompted
5. View decrypted secret content
6. Optionally reply to the secret

#### 3. Managing Your Secrets

1. Navigate to "Home" page
2. Switch to "My Data" tab
3. View all your created secrets
4. Click to expand and view:
   - Secret content
   - View statistics (who viewed, when)
   - Shared users list
   - Child secrets (replies)
5. Delete or hide secrets as needed

#### 4. Admin Dashboard

1. Log in as admin user
2. Navigate to `/dashboard`
3. Access different sections:
   - **Dashboard**: Overview statistics
   - **Users**: User management and moderation
   - **Secrets**: All secrets in the system (encrypted)
   - **Reports**: User reports and moderation
   - **Notifications**: System notifications
   - **Logger**: Activity logs

### Platform-Specific Usage

#### Telegram Mini App

1. Open the bot in Telegram
2. Launch the Mini App
3. Authenticate using Telegram credentials
4. Create or import wallet
5. Use the application normally

#### Web Application

1. Open the web application
2. Connect your Ethereum wallet
3. Sign a challenge message to authenticate
4. Create or import wallet
5. Use the application normally

## Security Notes

### Authentication

- **Telegram Users**: Authenticated via Telegram WebApp `initData` with cryptographic verification
- **Web Users**: Authenticated via Ethereum wallet signature challenge-response
- **Token Management**: JWT tokens stored in HTTP-only cookies with automatic refresh
- **Session Security**: Tokens expire and require refresh for continued access

### Encryption

- **Secrets**: Encrypted using NuCypher TACo threshold encryption
  - Only authorized recipients (by public address) can decrypt
  - Backend cannot decrypt secrets
  - Encryption uses blockchain-based conditions
- **Wallet Seeds**: Encrypted using AES-256 with user-provided password
- **Password Storage**: Optional server-side storage with AES encryption using public address + salt

### Data Protection

- **Local Storage**: Wallet seeds stored encrypted in browser localStorage
- **Sensitive Data Sanitization**: OpenReplay configured to obscure sensitive fields
- **Error Handling**: Comprehensive error boundaries prevent data leakage
- **Input Sanitization**: User inputs are sanitized before encryption and storage

### Access Control

- **Public Address Verification**: Only users with matching public addresses can decrypt
- **Time-Based Conditions**: Secrets can have unlock and expiration times
- **Admin Access**: Admin routes protected by role-based access control
- **Privacy Mode**: Users can control profile visibility

### Best Practices

- Never commit `.env` files with real credentials
- Use strong passwords for wallet encryption
- Backup wallet seeds securely
- Regularly update dependencies for security patches
- Review and audit smart contract interactions

## Contribution

We welcome contributions to TACoSec! Please follow these guidelines:

### Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Guidelines

- **Code Style**: Follow the existing code style and TypeScript conventions
- **Type Safety**: Maintain strict TypeScript typing
- **Error Handling**: Use the centralized error handling utilities
- **Testing**: Add tests for new features when possible
- **Documentation**: Update documentation for new features

### Pull Request Process

1. Ensure your code follows the project's style guidelines
2. Update documentation if needed
3. Add tests if applicable
4. Ensure all tests pass
5. Request review from maintainers

### Reporting Issues

When reporting issues, please include:
- Description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser/environment information
- Screenshots if applicable

## License

This project is licensed under the MIT License - see the `package.json` file for details.

---

## Powered By

🔐 **[TACo (Threshold Access Control)](https://taco.build)** — Client-side, threshold-based, decentralized encryption & access control  
⚡ **[React](https://react.dev/)** — JavaScript library for building user interfaces  
🔑 **[ethers.js](https://docs.ethers.org/)** — Wallet management & seed phrase authentication  
💬 **[Telegram Mini Apps](https://core.telegram.org/bots/webapps)** — In-chat application platform

### Authentication

- **Web Users:** Validated via seed phrase wallet signatures.
- **Telegram Access:** Telegram Mini App & Bot API authentication + seed phrase wallet signatures for the data access.

---

**TACoSec** • [Frontend](https://github.com/yourorg/tacosec-frontend) (you are here) • [Backend](https://github.com/yourorg/tacosec-backend) • *Powered by [TACo](https://taco.build) 💚* • **Built with ❤️ by [Web3Web4](https://web3web4.com)**