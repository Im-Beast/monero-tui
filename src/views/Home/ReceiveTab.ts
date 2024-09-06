import { crayon } from "@crayon/crayon";
import { HorizontalBlock, VerticalBlock } from "@tui/nice";
import { computed } from "@tui/signals";

import { Wallet } from "$moneroc/wallet.ts";

import { Address, Button, Popup, ScrollView, SmallButton, TextBox } from "../../shared/components.ts";
import { boldText, colors, separatedText, text } from "../../shared/styles.ts";
import { ObservableWalletCache } from "$utils/wallet_cache.ts";

export function ReceiveTab(wallet: Wallet, cache: ObservableWalletCache) {
  const account = computed(() => cache.accounts[cache.currentAccount]!);
  const addresses = computed(() => account.get().addresses);

  return new VerticalBlock(
    { id: "receive-tab", width: "95%", height: "100%", gap: 1 },
    separatedText.create("Receive"),
    new VerticalBlock(
      { width: "100%", x: "50%" },
      text.create(computed(() => `Address #${cache.currentAccount}`)),
      // TODO: Wrap/ellipse address
      boldText.create(computed(() => account.get().label)),
      text.create(computed(() => account.get().address)),
    ),
    new VerticalBlock(
      { width: "100%" },
      separatedText.create(
        computed(() => `Addresses (${addresses.get().length})`),
      ),
      SmallButton("[Create new address]", {
        async onClick() {
          let addressLabel: string | undefined;

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
                separatedText.create("Set the label of a new address"),
                TextBox("Account name", {
                  onChange(value) {
                    addressLabel = value;
                  },
                  onConfirm(value) {
                    addressLabel = value;
                    resolve();
                  },
                }),
                new HorizontalBlock(
                  { width: "100%", x: "50%", gap: 4 },
                  Button("Cancel", {
                    onClick() {
                      addressLabel = undefined;
                      resolve();
                    },
                  }),
                  Button("Create", {
                    onClick() {
                      if (addressLabel) {
                        resolve();
                      }
                    },
                  }),
                ),
              ),
            );
          });

          if (!addressLabel) return;

          await wallet.addSubaddress(cache.currentAccount, addressLabel);
        },
      }),
    ),
    computed(() => {
      const addrs = addresses.get();

      if (addrs.length) {
        return ScrollView(
          { id: "addresses", width: "100%", height: (h) => h - 14, gap: 1 },
          ...addrs.map((addressInfo) => Address(addressInfo)),
        );
      }

      return text.create("No addresses");
    }),
  );
}
