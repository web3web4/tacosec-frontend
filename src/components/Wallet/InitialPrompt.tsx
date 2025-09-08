import { MetroSwal } from "@/utils";

type PromptOptions = {
  onCreate: () => void;
  onImport: () => void;
  displayName: string;
};

export function showInitialPrompt({ onCreate, onImport, displayName }: PromptOptions) {
  MetroSwal.fire({
    icon: "info",
    title: `Welcome ${displayName}!`,
    html: `
      <p style="font-size:14px;">
        Welcome ${displayName} to our secret stashing and sharing service built on TACo! 🎉
      </p>
      <p style="font-size:14px;">
        You need a wallet to start enjoying our services!
      </p>
    `,
    showCancelButton: false,
    showDenyButton: true,
    confirmButtonText: "Create New",
    denyButtonText: "Import Existing",
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
