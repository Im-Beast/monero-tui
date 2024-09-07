import { VerticalBlock } from "@tui/nice";
import { computed, signal } from "@tui/signals";

import { Wallet } from "moneroc";
import { getWalletPath } from "$utils/wallet.ts";

import { boldText } from "../shared/styles.ts";
import { ActionButton, ErrorText, PasswordTextBox, Spinner } from "../shared/components.ts";

import { view, wallet, walletManager } from "../mod.ts";

let password = "";
const loading = signal(false);
const error = signal("");

async function logIn() {
  try {
    loading.set(true);
    const openedWallet = await Wallet.open(walletManager, await getWalletPath(), password, false);
    wallet.set(openedWallet);
    view.set("home");
  } catch (err) {
    error.set(err.message);
  }
}

export function Open() {
  return new VerticalBlock(
    { id: "open-view", width: "100%", height: "100%", x: "50%", y: "50%", gap: 1 },
    boldText.create("Log in to your wallet"),
    computed(() => {
      const isLoading = loading.get();
      const errorMessage = error.get();

      if (errorMessage) {
        setTimeout(() => {
          error.set("");
        }, 1500);
        loading.set(false);
        return ErrorText(errorMessage);
      }

      if (isLoading) {
        return Spinner("Opening wallet");
      }

      return new VerticalBlock(
        { width: (w) => Math.min(w, 40), x: "50%", y: "50%", gap: 1 },
        PasswordTextBox("Password", {
          password: true,
          onChange: (value) => (password = value),
          onConfirm: logIn,
        }),
        ActionButton("Log in", {
          onClick: logIn,
        }),
      );
    }),
  );
}
