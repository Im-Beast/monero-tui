import { HorizontalBlock, OverlayBlock, Style, VerticalBlock } from "@tui/nice";
import { crayon } from "@crayon/crayon";
import { computed, getIntermediate, signal } from "@tui/signals";
import { Suspense } from "@tui/tui/components";

import { Wallet } from "moneroc";

import { colors, separatedText, text } from "../../shared/styles.ts";
import { Button, CancelButton, Popup, Spinner, TextBox } from "../../shared/components.ts";
import { formatXMR } from "$utils/monero.ts";
import { ObservableWalletCache } from "$utils/wallet_cache.ts";
import { ErrorText, WarningText } from "../../shared/components/InfoText.ts";

const transactionInfo = new Style({
  width: "100%",
  height: "100%",
  string: crayon.bgHex(colors.backgroundHigher).hex(colors.text),
  skipIfTooSmall: true,
  text: {
    horizontalAlign: "center",
  },
  padding: { all: 2 },
  border: { all: crayon.bgHex(colors.backgroundHigher).hex(colors.monero), type: "thick" },
});

let address = "";
let amount = "";
const error = signal("");

export function SendTab(wallet: Wallet, cache: ObservableWalletCache) {
  const amountWidth = (width: number) => Math.max(Math.round(width * 0.2) - 3, 5);
  const intermediateCache = getIntermediate(cache);

  return new VerticalBlock(
    { id: "send-tab", width: "100%", gap: 1, x: "50%" },
    separatedText.create("Send"),
    computed(
      [error, intermediateCache.balance, intermediateCache.unlockedBalance],
      (error, balance, unlockedBalance) => {
        if (error) {
          return ErrorText(error);
        }

        if (balance !== unlockedBalance) {
          return WarningText(
            `Some of your funds seem to be still locked.\nYou might not be able to create a new transaction for a few minutes.`,
          );
        }

        return WarningText(
          `!! DO NOT USE FOR ACTUAL TRANSACTIONS! !!\n!! THIS IS NOT A PRODUCTION READY SOFTWARE !!`,
        );
      },
    ),
    new HorizontalBlock(
      { width: "100%" },
      new VerticalBlock(
        { width: (w) => w - amountWidth(w) - 3 },
        text.create("Address"),
        TextBox("4.. / 8.. / monero:.. / OpenAlias", {
          onChange(value) {
            address = value;
          },
        }),
      ),
      new VerticalBlock(
        { width: amountWidth },
        text.create("Amount"),
        TextBox("0.00", {
          onChange(value) {
            amount = value;
          },
        }),
      ),
      text.create("XMR", { margin: { bottom: 1, top: 2 } }),
    ),
    new HorizontalBlock(
      { width: "100%", x: (w) => w - 4 },
      Button("Send", {
        async onClick() {
          error.set("");
          try {
            await Popup("home", (resolve, reject) => {
              return new VerticalBlock(
                {
                  width: "100%",
                  height: "100%",
                  x: "50%",
                  y: "50%",
                  string: crayon.bgHex(colors.background),
                },
                Suspense(
                  "transaction",
                  async () => {
                    try {
                      const transaction = await wallet.createTransaction(
                        address,
                        await wallet.amountFromString(amount),
                        0,
                        cache.currentAccount,
                        false,
                      );

                      const txId = await transaction.txid(",", false);
                      const txFee = await transaction.fee();
                      const txAmount = await transaction.amount();

                      return new OverlayBlock({
                        string: crayon.bgHex(colors.backgroundHigher),
                        x: 2,
                        y: (h) => h - 1,
                        bg: new VerticalBlock(
                          { width: "50%", height: "50%", x: "50%", y: "50%" },
                          transactionInfo.create(
                            `Transaction id: ${txId}\nFee: ${formatXMR(txFee)}\nAmount: ${formatXMR(txAmount)}`,
                          ),
                        ),
                        fg: new HorizontalBlock(
                          { width: (w) => w - 4 },
                          new HorizontalBlock(
                            { width: "50%" },
                            CancelButton("Cancel", { onClick: reject }),
                          ),
                          new HorizontalBlock(
                            { width: "50%", x: "100%" },
                            Button("Confirm", {
                              async onClick() {
                                await transaction.commit("", false, false);
                                resolve();
                              },
                            }),
                          ),
                        ),
                      });
                    } catch (err) {
                      reject(err);
                      return text.create("Error");
                    }
                  },
                  Spinner("Loading transaction details"),
                ),
              );
            });
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
}
