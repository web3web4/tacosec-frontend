import { MdAccountBalanceWallet, MdDownload, MdAdd } from "react-icons/md";
import { useUser } from "@/context";
import { formatAddress } from '@/utils';

interface WelcomeScreenProps {
  onChoice: (choice: "create" | "import") => void;
}

export function WelcomeScreen({ onChoice }: WelcomeScreenProps) {
  const { userData, isBrowser } = useUser();

  const displayName =
    userData?.user?.firstName && userData?.user?.lastName
      ? `${userData?.user?.firstName} ${userData?.user?.lastName}`
      : userData?.user?.username
      ? userData.user.username
      : "Friend";
  const address = userData?.user?.publicAddress;
  return (
    <div className="onboarding-screen">
      <div className="onboarding-header">
        <h1>
          <MdAccountBalanceWallet />
          Welcome {displayName}!
        </h1>
        <p>
          Welcome {displayName} to our secret stashing and sharing service built
          on TACoSec! 🎉
        </p>
        <p>You need a wallet to start enjoying our services!</p>
      </div>

      <div className="onboarding-content">
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
            backgroundColor: "rgba(255, 165, 0, 0.1)",
            border: "1px solid rgba(255, 165, 0, 0.3)",
            borderRadius: "12px",
            padding: "20px",
            color: "#b35c00",
            fontSize: "15px",
            lineHeight: "1.6",
          }}
        >
          {!isBrowser ? (
            <>
              <p style={{ marginBottom: "10px", fontWeight: "500" }}>
                You already have a wallet address:
                <br />
                <span style={{ fontWeight: "bold", color: "#ff8c00" }}>
                  {formatAddress(8,address as string)}
                </span>
              </p>
              <p style={{ marginBottom: "0" }}>
                We recommend <strong>importing your existing wallet</strong> if
                you still have your seed phrase.
                <br />
                Creating a new wallet will generate new secrets and you’ll lose
                access to your previous ones.
              </p>
            </>
          ) : (
            <p style={{ marginBottom: "0" }}>
              You can <strong>import your existing wallet</strong> if you
              already have one.
              <br />
              Creating a new wallet will generate new secrets for you and you will lose your old ones..
            </p>
          )}
        </div>
      </div>

      <div className="onboarding-actions">
        <button
          className="onboarding-btn primary"
          onClick={() => onChoice("create")}
        >
          <MdAdd />
          Create New Wallet
        </button>

        <button
          className="onboarding-btn secondary"
          onClick={() => onChoice("import")}
        >
          <MdDownload />
          Import Existing Wallet
        </button>
      </div>
    </div>
  );
}
