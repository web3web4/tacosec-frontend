import Swal from "sweetalert2";
import { MetroSwal } from "../utils/metroSwal";

export async function promptPassword() {
  return await MetroSwal.fire({
    title: "Set Password",
    input: "password",
    inputLabel: "Enter a password to encrypt your wallet",
    inputPlaceholder: "Your secure password",
    inputAttributes: {
      autocapitalize: "off",
      autocorrect: "off",
    },
    showCancelButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
  });
}

export async function confirmSavePassword() {
  return await MetroSwal.fire({
    title: "Save password",
    text: "Do you want to save the wallet password on our servers?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
    allowOutsideClick: false,
    allowEscapeKey: false,
  });
}

export async function showBackupReminder() {
  return await MetroSwal.fire({
    icon: "warning",
    title: "Backup Required",
    text: "You must backup your wallet seed phrase now.",
    showCancelButton: true,
    confirmButtonText: "Backup now",
    cancelButtonText: "Later",
  });
}

export async function promptPasswordWithSaveOption() {
  // Check if savePasswordInBackend exists in localStorage
  const showSaveOption = localStorage.getItem("savePasswordInBackend") === null;
  
  // Create HTML content with password fields and checkbox
  const htmlContent = `
    <div class="metro-swal-input-container" style="margin-bottom: 1rem;">
      <label for="password" class="metro-swal-label" style="display: block; text-align: left; margin-bottom: 0.5rem; font-size: 0.9rem;">
        Password
      </label>
      <input type="password" id="password" class="input-field">
    </div>
    
    <div class="metro-swal-input-container" style="margin-bottom: 1rem;">
      <label for="confirm-password" class="metro-swal-label" style="display: block; text-align: left; margin-bottom: 0.5rem; font-size: 0.9rem;">
        Confirm Password
      </label>
      <input type="password" id="confirm-password" class="input-field">
    </div>
    
    ${showSaveOption ? `
    <div class="metro-swal-checkbox-container" style="margin-top: 1rem; text-align: left;">
      <input type="checkbox" id="save-password-checkbox" class="metro-swal-checkbox">
      <label for="save-password-checkbox" style="margin-left: 0.5rem; font-size: 0.9rem;">
        Save wallet password on our servers ?
      </label>
    </div>` : ''}
  `;
  
  const result = await MetroSwal.fire({
    title: "Set Password",
    html: htmlContent,
    showCancelButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    preConfirm: () => {
      // Get the password values
      const password = (document.getElementById('password') as HTMLInputElement)?.value;
      const confirmPassword = (document.getElementById('confirm-password') as HTMLInputElement)?.value;
      
      // Get checkbox value if it exists
      let savePassword = false;
      if (showSaveOption) {
        const checkbox = document.getElementById('save-password-checkbox') as HTMLInputElement;
        savePassword = checkbox?.checked || false;
      }
      
      // Validate password
      if (!password) {
        Swal.showValidationMessage('Please enter a password');
        return false;
      }
      
      // Validate password confirmation
      if (password !== confirmPassword) {
        Swal.showValidationMessage('Passwords do not match');
        return false;
      }
      
      return { password, savePassword };
    }
  });
  
  // Return the result with both password and save preference
  return {
    isConfirmed: result.isConfirmed,
    value: result.value?.password,
    savePassword: result.value?.savePassword || false
  };
}
