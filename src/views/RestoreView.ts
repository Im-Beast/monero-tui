import { HorizontalBlock, Style, VerticalBlock } from "@tui/nice";
import { computed, signal } from "@tui/signals";
import { crayon } from "@crayon/crayon";
import { createTextBox } from "@tui/tui/components";

import { Wallet } from "moneroc";
import { getWalletPath } from "$utils/wallet.ts";

import { ActionButton, ErrorText, Spinner, TextBox } from "../shared/components.ts";
import { colors, separatedText, text } from "../shared/styles.ts";
import { view, wallet, walletManager } from "../mod.ts";

export const SeedTextBox = createTextBox((() => {
  const base = new Style({
    width: "100%",
    height: 8,
    string: crayon.bgHex(colors.backgroundHigher).hex(colors.text),
    padding: { all: 1 },
    border: {
      all: crayon.hex(colors.text),
      type: "rounded",
    },
    text: {
      wrap: "wrap",
      overflow: "ellipsis",
    },
  });
  const hover = base.derive({
    string: crayon.bgHex(colors.backgroundHighest).hex(colors.text),
    border: { all: crayon.hex(colors.monero) },
  });
  const active = hover.derive({
    border: { all: crayon.hex(colors.moneroDark) },
  });
  const cursor = new Style({
    string: crayon.bgHex(colors.monero).hex(colors.text),
  });
  return { base, hover, active, cursor };
})());

let walletName = "";
let seed = "";
let height = "";
let password = "";
let passwordConfirmation = "";

const error = signal("");
const loading = signal(false);

export function Restore() {
  return new VerticalBlock(
    { width: "100%", height: "100%", x: "50%" },
    separatedText.create("Restore your wallet"),
    text.create("Wallet name"),
    new VerticalBlock(
      { width: (w) => w - 2, x: "50%" },
      TextBox("Wallet name", {
        onChange: (value) => (walletName = value),
      }),
      text.create("Enter your 25 word mnemonic seed"),
      SeedTextBox("Seed words", {
        pattern: /[a-z]| /,
        onChange: (value) => (seed = value),
      }),
      text.create("Restore height of the wallet"),
      TextBox("Restore height", {
        pattern: /\d/,
        onChange: (value) => (height = value),
      }),
      text.create("Password to your wallet"),
      TextBox("Password", {
        password: true,
        onChange: (value) => (password = value),
      }),
      TextBox("Password confirmation", {
        password: true,
        onChange: (v) => (passwordConfirmation = v),
      }),
    ),
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

      return new HorizontalBlock(
        { width: "100%", x: "50%", gap: 6 },
        ActionButton("Back", {
          onClick: () => view.set("introduction"),
        }),
        ActionButton("Restore", {
          async onClick() {
            if (!walletName) {
              error.set("You have to specify wallet name");
              return;
            }

            if (!height) {
              error.set("Set your wallet height");
              return;
            }

            if (password !== passwordConfirmation) {
              error.set("Passwords don't match");
              return;
            }

            const words = seed.split(" ");
            const validSeed = words.length === 25 && words.every((word) => word.length);
            if (!validSeed) {
              error.set("Seed is invalid");
              return;
            }

            error.set("");

            try {
              loading.set(true);
              const restoredWallet = await Wallet.recover(
                walletManager,
                await getWalletPath(),
                password,
                words.join(" "),
                BigInt(height),
              );
              wallet.set(restoredWallet);
              view.set("home");
            } catch (err) {
              error.set(err.message);
            }
          },
        }),
      );
    }),
  );
}
