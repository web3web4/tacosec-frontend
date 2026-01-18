import { FaArrowsRotate } from "react-icons/fa6";
import { useState } from 'react';
import { formatAddress } from '@/utils';
import './UserDisplayToggle.css';

interface UserDisplayToggleProps {
  userData: unknown; // Accept any object type with type safety
}

// Type guard to check if userData has the required properties
const hasUserFields = (obj: unknown): obj is { 
  firstName?: string; 
  lastName?: string; 
  name?: string;
  username: string;
  latestPublicAddress?: string;
  publicAddress?: string;
} => {
  return typeof obj === 'object' && 
         obj !== null
};

export default function UserDisplayToggle({ userData }: UserDisplayToggleProps) {
  const [showAddress, setShowAddress] = useState(false);
  
  // Use type guard to safely access properties
  if (!hasUserFields(userData)) {
    return <div className="user-display">Unknown User</div>;
  }
  
  // Now TypeScript knows userData has the required fields
  // Check if the required fields exist - prioritize name field over firstName/lastName, then username
  const hasNameField = userData.name && userData.name.trim() !== "" && userData.username !== "Unknown";
  const hasFirstLastName = userData.firstName && userData.username !== "Unknown";
  const hasUsername = userData.username && userData.username.trim() !== "" && userData.username !== "Unknown";
  const hasName = hasNameField || hasFirstLastName || hasUsername;
  const addressValue = userData.latestPublicAddress || userData.publicAddress;
  const hasAddress = !!addressValue;
  
  // Determine what to display - prioritize name field over firstName/lastName, then username
  const displayName = hasName ? 
    (hasNameField ? userData.name : (hasFirstLastName ? `${userData.firstName} ${userData.lastName}` : userData.username)) : null;
  const displayAddress = hasAddress ? formatAddress(8, addressValue as string) : null;
  
  // If only one display option is available, show it without toggle
  if (!hasName && hasAddress) return <div className="user-display">{displayAddress}</div>;
  if (hasName && !hasAddress) return <div className="user-display">{displayName}</div>;
  
  // If both options are available, show with toggle
  if (hasName && hasAddress) {
    return (
      <div className="user-display-toggle">
        <div className="user-display-text">
          {showAddress ? displayAddress : displayName}
        </div>
        <button 
          className="toggle-icon" 
          onClick={(e) => {
            e.stopPropagation(); // Prevent event bubbling
            setShowAddress(!showAddress);
          }}
          title={showAddress ? "Show name" : "Show address"}
        >
          <FaArrowsRotate size={12} color='var(--metro-green)'/>
        </button>
      </div>
    );
  }
  
  // Fallback if no data is available
  return <div className="user-display">Unknown User</div>;
};
