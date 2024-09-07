import { crayon } from "@crayon/crayon";
import { HorizontalBlock, VerticalBlock } from "@tui/nice";
import { computed, getIntermediate } from "@tui/signals";

import { Wallet } from "moneroc";
import { formatXMR } from "$utils/monero.ts";

import { colors, separatedText, text } from "../../shared/styles.ts";
import { Account, Button, Popup, ScrollView, SmallButton, TextBox } from "../../shared/components.ts";
import { ObservableWalletCache } from "$utils/wallet_cache.ts";

export function AccountTab(wallet: Wallet, cache: ObservableWalletCache) {
  return new VerticalBlock(
    { id: "account-tab", width: "95%", height: "100%", gap: 1 },
    separatedText.create("Balance All"),
    new VerticalBlock(
      {},
      new HorizontalBlock(
        { gap: 7 },
        // FIXME: Total balance = sum(accounts.balance)
        text.create("Total balance:", { width: 25 }),
        text.create(computed(() => `${formatXMR(cache.balance)} XMR`)),
      ),
      new HorizontalBlock(
        { gap: 7 },
        text.create("Total unlocked balance:", { width: 25 }),
        text.create(computed(() => `${formatXMR(cache.unlockedBalance)} XMR`)),
      ),
    ),
    new VerticalBlock(
      { width: "100%" },
      separatedText.create(computed(() => `Accounts (${cache.accounts.length})`)),
      SmallButton("[Create new account]", {
        async onClick() {
          let accountLabel: string | undefined;

          await Popup("home", (resolve) => {
            return new VerticalBlock(
              {
                width: "100%",
                height: "100%",
                x: "50%",
                y: "50%",
                string: crayon.bgHex(colors.background),
              },
              new VerticalBlock(
                { width: "50%" },
                separatedText.create("Set the label of a new account"),
                TextBox("Account name", {
                  onChange(value) {
                    accountLabel = value;
                  },
                  onConfirm(value) {
                    accountLabel = value;
                    resolve();
                  },
                }),
                new HorizontalBlock(
                  { width: "100%", x: "50%", gap: 4 },
                  Button("Cancel", {
                    onClick() {
                      accountLabel = undefined;
                      resolve();
                    },
                  }),
                  Button("Create", {
                    onClick() {
                      if (accountLabel) {
                        resolve();
                      }
                    },
                  }),
                ),
              ),
            );
          });

          if (!accountLabel) return;
          await wallet.addSubaddressAccount(accountLabel);
        },
      }),
    ),
    computed([getIntermediate(cache.accounts)], (accounts) => {
      if (accounts.length) {
        return ScrollView(
          { id: "accounts", width: "100%", height: (h) => h - 13, gap: 1 },
          ...accounts.map((account) => Account(cache, account)),
        );
      }

      return text.create("No accounts");
    }),
  );
}
