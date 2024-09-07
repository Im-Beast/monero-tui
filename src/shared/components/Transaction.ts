import { crayon } from "@crayon/crayon";
import { BorderCharsets, calc, HorizontalBlock, Style, VerticalBlock } from "@tui/nice";

import { formatXMR } from "$utils/monero.ts";
import { WalletTransactionInfo } from "$utils/wallet_cache.ts";

import { colors } from "../styles.ts";

export type TransactionInfoBlock = HorizontalBlock;

const sent = crayon.bold.bgHex(colors.backgroundHigher).hex(colors.monero)("↑ Sent ");
const received = crayon.bold.bgHex(colors.backgroundHigher).green("↓ Received ");
const pending = crayon.bold.bgHex(colors.backgroundHigher).yellow("(⏱ Pending)");

const timeFormatter = new Intl.RelativeTimeFormat(navigator.language);
function formatTimestamp(moneroTimestamp: number | bigint): string {
  const miliseconds = -(Date.now() - (Number(moneroTimestamp) * 1000));

  const seconds = miliseconds / 1000;
  if (-seconds < 60) return timeFormatter.format(Math.floor(seconds), "seconds");

  const minutes = seconds / 60;
  if (-minutes < 60) return timeFormatter.format(Math.floor(minutes), "minutes");

  const hours = minutes / 60;
  if (-hours < 24) return timeFormatter.format(Math.floor(hours), "hours");

  const days = hours / 24;
  return timeFormatter.format(Math.floor(days), "days");
}

export const paddedText = new Style({ string: crayon.white, padding: { bottom: 1 } });
export const paddedBoldText = new Style({ string: crayon.bold.white, padding: { top: 1 } });

const coloredEdge = {
  padding: { left: 1 },
  border: {
    left: crayon.hex(colors.monero),
    charset: BorderCharsets.thick,
  },
} as const;

export function Transaction(info: WalletTransactionInfo): TransactionInfoBlock {
  let text = info.direction === "out" ? sent : received;
  if (info.isPending) {
    text += pending;
  }

  return new HorizontalBlock(
    { id: info.hash, width: "100%", y: "50%", string: crayon.bgHex(colors.backgroundHigher) },
    new VerticalBlock(
      { width: "50%" },
      paddedBoldText.create(text, coloredEdge),
      paddedText.create(`${formatXMR(info.amount)} XMR`, coloredEdge),
    ),
    new VerticalBlock(
      { width: "50%", x: calc("100% - 3") },
      paddedBoldText.create("Date"),
      paddedText.create(formatTimestamp(info.timestamp)),
    ),
  );
}
