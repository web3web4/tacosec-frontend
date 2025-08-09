import { MetroSwal } from "../../utils/metroSwal";

type PromptOptions = {
  onCreate: () => void;
  onImport: () => void;
};

export function showInitialPrompt({ onCreate, onImport }: PromptOptions) {
  MetroSwal.fire({
    icon: "info",
    title: "No Wallet Found",
    html: `
      <p style="font-size:14px;">If you already have a wallet, you can import it using your secret phrase.</p>
      <p style="font-size:14px;">Or create a new one to start using our services.</p>
    `,
    showCancelButton: false,
    showDenyButton: true,
    confirmButtonText: "Create Wallet",
    denyButtonText: "Import Wallet",
    allowOutsideClick: false,
    allowEscapeKey: false,
  }).then((result) => {
    if (result.isConfirmed) {
      onCreate();
    } else if (result.isDenied) {
      onImport();
    }
  });
}
