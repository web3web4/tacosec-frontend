import Swal from "sweetalert2";

export async function promptPassword() {
  return await Swal.fire({
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
  return await Swal.fire({
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
  return await Swal.fire({
    icon: "warning",
    title: "Backup Required",
    text: "You must backup your wallet seed phrase now.",
    showCancelButton: true,
    confirmButtonText: "Backup now",
    cancelButtonText: "Later",
  });
}
