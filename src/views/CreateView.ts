import { HorizontalBlock, VerticalBlock } from "@tui/nice";
import { computed, signal } from "@tui/signals";

import { Wallet } from "moneroc";
import { getWalletPath } from "$utils/wallet.ts";

import { separatedText, text } from "../shared/styles.ts";
import { ActionButton, ErrorText, PasswordTextBox, Spinner } from "../shared/components.ts";

import { view, wallet, walletManager } from "../mod.ts";

let password = "";
let passwordConfirmation = "";
const error = signal("");
const loading = signal(false);

export function Create() {
  return new VerticalBlock(
    { id: "create-view", width: "100%", height: "100%", x: "50%" },
    separatedText.create("Create new wallet"),
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
        return Spinner("Creating new wallet");
      }

      return new VerticalBlock(
        { width: "100%", height: "100%", x: "50%" },
        text.create("Choose a new password for your wallet"),
        PasswordTextBox("Password", {
          password: true,
          onChange(value) {
            password = value;
          },
        }),
        PasswordTextBox("Password confirmation", {
          password: true,
          onChange(value) {
            passwordConfirmation = value;
          },
        }),
        new HorizontalBlock(
          { width: "100%", x: "50%", gap: 6 },
          ActionButton("Back", {
            onClick: () => view.set("introduction"),
          }),
          ActionButton("Create", {
            async onClick() {
              if (password !== passwordConfirmation) {
                error.set("Passwords don't match");
                return;
              } else if (!password) {
                error.set("Password cannot be empty");
                return;
              } else {
                error.set("");
              }

              try {
                loading.set(true);
                const createdWallet = await Wallet.create(
                  walletManager,
                  await getWalletPath(),
                  password,
                  false,
                );
                wallet.set(createdWallet);
                view.set("home");
              } catch (err) {
                if (err instanceof Error) {
                  error.set(err.message);
                } else {
                  error.set(String(err));
                }
              }
            },
          }),
        ),
      );
    }),
  );
}
