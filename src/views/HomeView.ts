import { HorizontalBlock, Style, VerticalBlock } from "@tui/nice";
import { crayon } from "@crayon/crayon";
import { computed, getIntermediate, signal } from "@tui/signals";

import { Wallet } from "moneroc";
import { formatXMR } from "$utils/monero.ts";

import { AccountTab } from "./Home/AccountTab.ts";
import { SendTab } from "./Home/SendTab.ts";
import { ReceiveTab } from "./Home/ReceiveTab.ts";
import { TransactionsTab } from "./Home/TransactionsTab.ts";

import { colors, text } from "../shared/styles.ts";
import { ProgressBar, TabButton } from "../shared/components.ts";
import { WalletCache } from "$utils/wallet_cache.ts";

const balanceCard = new Style({
  width: "100%",
  string: crayon.bgHex(colors.backgroundHigher).hex(colors.text),
  margin: { all: 1 },
  padding: { all: 1 },
  border: {
    all: crayon.bold.lightWhite,
    type: "thick",
  },
  text: {
    horizontalAlign: "center",
  },
});

const leftSideWidth = (width: number) => Math.max(width * 0.1, 30) - 2;
const rightSideWidth = (width: number) => width - Math.max(width * 0.1, 30) - 2;

type Tab = "account" | "send" | "receive" | "transactions";
const currentTab = signal<Tab>("account");

export function Home(wallet: Wallet, { cache }: WalletCache): VerticalBlock {
  return new VerticalBlock(
    { id: "home-view", width: "100%", height: "100%", string: crayon.bgHex(colors.background) },
    new HorizontalBlock(
      { width: "100%", height: "100%", x: 2 },
      new VerticalBlock(
        { width: leftSideWidth, height: "100%", x: "50%", gap: 1 },
        balanceCard.create(
          computed(() =>
            `\
Monero Account #${cache.currentAccount}
${cache.accounts[cache.currentAccount]?.label}
XMR: ${formatXMR(cache.balance)}`
          ),
        ),
        //
        TabButton("Account", "tab", {
          onClick() {
            currentTab.set("account");
          },
        }),
        TabButton("Send", "tab", {
          onClick() {
            currentTab.set("send");
          },
        }),
        TabButton("Receive", "tab", {
          onClick() {
            currentTab.set("receive");
          },
        }),
        TabButton("Transactions", "tab", {
          onClick() {
            currentTab.set("transactions");
          },
        }),
        //
        computed(() => {
          if (cache.synchronized) {
            return text.create(
              computed(() => crayon`{bgHex(${colors.background}) {green.bold ✓} Blocks are synchronized}`),
            );
          }
          return ProgressBar(
            "Blocks remaining:",
            getIntermediate(cache).blockChainHeight,
            getIntermediate(cache).daemonblockChainHeight!,
          );
        }),
      ),
      new VerticalBlock(
        { width: rightSideWidth, height: "100%", y: 2, x: "50%" },
        computed([currentTab], (currentTab) => {
          switch (currentTab) {
            case "account":
              return AccountTab(wallet, cache);
            case "send":
              return SendTab(wallet, cache);
            case "receive":
              return ReceiveTab(wallet, cache);
            case "transactions":
              return TransactionsTab(cache);
          }
        }),
      ),
    ),
  );
}
