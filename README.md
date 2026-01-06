# TacoSec Frontend

A secure, decentralized secret sharing platform built with React and TypeScript, leveraging NuCypher's Threshold Access Control Objects (TACO) for end-to-end encryption. TacoSec enables users to securely share passwords, API keys, and other sensitive data with granular access control and time-based conditions.

## Project Description

TacoSec is a web application that provides a secure way to share sensitive information (passwords, API keys, credentials) with others using threshold cryptography. The platform uses NuCypher TACO technology to encrypt secrets that can only be decrypted by authorized recipients, ensuring that even the platform itself cannot access the shared data.

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
- Developers and security-conscious users

## Features

### Core Features

- **🔐 Threshold Encryption**: Secrets are encrypted using NuCypher TACO, ensuring only authorized recipients can decrypt
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
- **🌐Wallet Support**

### Security Features

- **Wallet-Based Authentication**: Ethereum wallet signature authentication for web users
- **Encrypted Seed Storage**: Wallet seeds are encrypted and stored locally
- **Password Management**: Optional password storage with server-side encryption
- **Report System**: Report inappropriate content or security issues
- **Access Logging**: Comprehensive logging of user actions and secret access

### Admin Features

- **User Management**: View, manage, and moderate users
- **Secret Management**: Monitor all secrets in the system
- **Report Management**: Review and resolve user reports
- **Notification Management**: View system notifications
- **Activity Logging**: Monitor user actions and system events
- **Statistics Dashboard**: View platform-wide statistics

## Technical Overview

### Architecture

TacoSec follows a component-based React architecture with clear separation of concerns:

1. **Context Layer**: Global state management using React Context API
   - `UserContext`: User authentication and profile data
   - `WalletContext`: Ethereum wallet management and encryption keys
   - `HomeContext`: Home page state and data management
   - `SnackbarContext`: Global notification system
   - `NavigationGuardContext`: Route protection and navigation

2. **Service Layer**: API communication abstraction
   - `authService`: Authentication and token management
   - `secretsService`: Secret CRUD operations
   - `usersService`: User profile and search operations
   - `adminService`: Admin dashboard operations
   - `supportService`: Support ticket management.

3. **Hooks Layer**: Reusable business logic
   - `useTaco`: TACO encryption/decryption operations
   - `useSecretDecryption`: Secret decryption workflow
   - `useSecrets`: Secret data management
   - `useAddData`: Secret creation workflow
   - `useUser`: User data management
   - Custom hooks for alerts, reports, notifications, etc.

4. **Component Layer**: UI components organized by feature
   - Pages: Main application routes
   - Sections: Feature-specific UI sections
   - Components: Reusable UI components
   - Error Boundaries: Error handling at multiple levels

### Data Flow

1. **Secret Creation**:
   - User enters secret data and selects recipients
   - Data is encrypted using TACO with recipient public addresses as conditions
   - Encrypted data is sent to backend API
   - Backend stores encrypted payload (cannot decrypt)

2. **Secret Decryption**:
   - User requests secret from backend
   - Encrypted payload is retrieved
   - TACO decrypts using user's wallet signature
   - Decrypted secret is displayed to user

3. **Authentication Flow**:
   - **Telegram**: Uses Telegram WebApp initData for authentication
   - **Web**: Uses Ethereum wallet signature challenge-response

### Key Files and Responsibilities

- `src/App.tsx`: Main application entry point, routing, and provider setup
- `src/wallet/walletContext.tsx`: Wallet creation, encryption, and management
- `src/hooks/useTaco.ts`: TACO encryption/decryption wrapper
- `src/services/secrets/secretsService.ts`: API calls for secret operations
- `src/pages/Home/Home.tsx`: Main user interface for viewing secrets
- `src/pages/AddData/AddData.tsx`: Secret creation interface
- `src/pages/Dashboard/`: Admin dashboard components
- `src/utils/config.ts`: Environment configuration management
- `craco.config.js`: Webpack configuration for crypto polyfills

## Tech Stack

### Core Technologies

- **React**: `^19.1.0` - UI framework
- **TypeScript**: `^5.8.3` - Type safety
- **React Router**: `^7.5.0` - Client-side routing
- **Ethers.js**: `^5.7.2` - Ethereum wallet and blockchain interaction

### Encryption & Security

- **@nucypher/taco**: `0.7.0-alpha.5` - Threshold Access Control Objects
- **@nucypher/taco-auth**: `0.4.0-alpha.5` - TACO authentication
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
- **Yarn**: Package manager (npm can be used as alternative)
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
   or
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env-example .env
   ```
   
   Edit `.env` and configure the following variables:
   ```env
   REACT_APP_TG_SECRET_SALT=your_telegram_secret_salt
   REACT_APP_TACO_DOMAIN=tapir
   REACT_APP_TACO_RITUAL_ID=6
   REACT_APP_RPC_PROVIDER_URL=https://rpc-amoy.polygon.technology
   REACT_APP_API_BASE_URL=https://your-backend-api-url.com
   REACT_APP_BOT_USER_NAME=@YourTelegramBot
   REACT_APP_OPENREPLAY_PROJECT_KEY=your_openreplay_key
   ```

4. **Start the development server**
   ```bash
   yarn start
   ```
   or
   ```bash
   npm start
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
| `REACT_APP_TACO_DOMAIN` | NuCypher TACO domain name | `tapir` (testnet) |
| `REACT_APP_TACO_RITUAL_ID` | TACO ritual ID for encryption | `6` |
| `REACT_APP_RPC_PROVIDER_URL` | Ethereum RPC provider URL | `https://rpc-amoy.polygon.technology` |
| `REACT_APP_API_BASE_URL` | Backend API base URL | `https://api.tacosec.com` |
| `REACT_APP_BOT_USER_NAME` | Telegram bot username | `@TacoSecBot` |

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

### Common Workflows

#### 1. Creating a Secret

1. Navigate to the "Add Data" page
2. Enter a title/name for your secret
3. Enter the secret value (password, API key, etc.)
4. Search and select users to share with
5. (Optional) Set time-based conditions:
   - Unlock time: Secret becomes accessible at a future date
   - Expiration time: Secret becomes inaccessible after a date
6. Click "Encrypt and Save"
7. Wait for encryption to complete (uses TACO threshold encryption)

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
   - **Secrets**: All secrets in the system
   - **Reports**: User reports and moderation
   - **Notifications**: System notifications
   - **Logger**: Activity logs

### Telegram Mini App Usage

1. Open the bot in Telegram
2. Launch the Mini App
3. Authenticate using Telegram credentials
4. Create or import wallet
5. Use the application normally

### Web Application Usage

1. Open the web application
2. Connect your Ethereum wallet
3. Sign a challenge message to authenticate
4. Create or import wallet
5. Use the application normally

## Screenshots

<!-- Add screenshots here when available -->

### Home Page - My Data Tab
![Home - My Data](screenshots/home-mydata.png)
*View and manage your created secrets*

### Home Page - Shared With Me Tab
![Home - Shared](screenshots/home-shared.png)
*View secrets shared with you*

### Add Data Page
![Add Data](screenshots/add-data.png)
*Create and encrypt new secrets*

### Admin Dashboard
![Admin Dashboard](screenshots/admin-dashboard.png)
*Admin overview and statistics*

### Secret View Statistics
![View Statistics](screenshots/secret-views.png)
*Track who viewed your secrets*

---

**Note**: Replace the placeholder image paths above with actual screenshot paths once screenshots are added to the repository.

## Folder Structure

```
taco-front/
├── public/                 # Static assets
│   ├── .well-known/       # Well-known files (Farcaster, etc.)
│   ├── favicon.ico        # Site favicon
│   ├── index.html         # HTML template
│   └── manifest.json      # PWA manifest
├── src/
│   ├── assets/            # Images, icons, and static assets
│   │   ├── icons/         # Application icons
│   │   └── images/        # Image assets
│   ├── components/        # Reusable UI components
│   │   ├── AdminSidebar/  # Admin navigation sidebar
│   │   ├── BottomNav/     # Bottom navigation bar
│   │   ├── ErrorBoundary/ # Error boundary components
│   │   ├── OnboardingFlow/# Wallet onboarding screens
│   │   ├── CustomPopup/   # Custom popup components
│   │   └── ...            # Other components
│   ├── context/           # React Context providers
│   │   ├── UserContext.tsx      # User authentication state
│   │   ├── HomeContext.tsx      # Home page state
│   │   ├── NavigationGuardContext.tsx  # Route protection
│   │   └── SnackbarContext.tsx  # Global notifications
│   ├── hooks/             # Custom React hooks
│   │   ├── useTaco.ts           # TACO encryption/decryption
│   │   ├── useSecretDecryption.ts  # Secret decryption logic
│   │   ├── useSecrets.ts        # Secret data management
│   │   ├── useAddData.ts        # Secret creation logic
│   │   └── ...                  # Other hooks
│   ├── localstorage/     # LocalStorage utilities
│   │   └── walletStorage.ts     # Wallet data storage
│   ├── pages/            # Page components (routes)
│   │   ├── Home/         # Main home page
│   │   ├── AddData/      # Secret creation page
│   │   ├── Settings/     # User settings page
│   │   ├── Dashboard/    # Admin dashboard
│   │   └── Alerts/       # Alerts/notifications page
│   ├── section/          # Feature-specific sections
│   │   ├── Home/         # Home page sections
│   │   │   ├── MyData/           # User's secrets section
│   │   │   ├── SharedWithMy/     # Shared secrets section
│   │   │   └── ChildrenSection/  # Child secrets section
│   │   └── Setting/      # Settings sections
│   ├── services/         # API service layer
│   │   ├── auth/         # Authentication services
│   │   ├── secrets/      # Secret CRUD services
│   │   ├── users/        # User services
│   │   ├── admin/        # Admin services
│   │   └── support/      # Support services
│   ├── types/            # TypeScript type definitions
│   │   ├── types.ts      # Main type definitions
│   │   ├── context.ts    # Context types
│   │   ├── component.ts  # Component prop types
│   │   └── wallet.ts     # Wallet types
│   ├── utils/            # Utility functions
│   │   ├── config.ts           # Environment config
│   │   ├── authManager.ts      # Token management
│   │   ├── cookieManager.ts    # Cookie utilities
│   │   ├── errorHandler.ts     # Error handling
│   │   ├── walletUtils.ts      # Wallet utilities
│   │   └── ...                 # Other utilities
│   ├── wallet/            # Wallet management
│   │   ├── walletContext.tsx   # Wallet context provider
│   │   ├── WalletSetup.tsx     # Wallet setup component
│   │   └── ImportWallet.tsx    # Wallet import component
│   ├── App.tsx           # Main application component
│   ├── index.tsx        # Application entry point
│   └── index.css        # Global styles
├── .env-example          # Environment variables template
├── .eslintrc.json        # ESLint configuration
├── .gitignore            # Git ignore rules
├── craco.config.js       # CRACO webpack configuration
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

### Key Directories Explained

- **`src/components/`**: Reusable UI components used across the application
- **`src/pages/`**: Top-level page components corresponding to routes
- **`src/section/`**: Feature-specific UI sections used within pages
- **`src/services/`**: API communication layer, organized by domain
- **`src/hooks/`**: Custom React hooks encapsulating business logic
- **`src/context/`**: Global state management using React Context
- **`src/utils/`**: Shared utility functions and helpers
- **`src/wallet/`**: Ethereum wallet creation, encryption, and management
- **`src/types/`**: TypeScript type definitions for type safety

## Security Notes

### Authentication

- **Telegram Users**: Authenticated via Telegram WebApp `initData` with cryptographic verification
- **Web Users**: Authenticated via Ethereum wallet signature challenge-response
- **Token Management**: JWT tokens stored in HTTP-only cookies with automatic refresh
- **Session Security**: Tokens expire and require refresh for continued access

### Encryption

- **Secrets**: Encrypted using NuCypher TACO threshold encryption
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

We welcome contributions to TacoSec! Please follow these guidelines:

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

**Built with ❤️ by Web3Web4**

For more information, visit [TacoSec.com](https://tacosec.com) or contact the development team.
