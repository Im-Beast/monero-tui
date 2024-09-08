import { crayon } from "@crayon/crayon";
import { Style, StyleBlock } from "@tui/nice";

import { createButton } from "@tui/tui/components";
import { tui } from "@tui/tui";

import { ObservableWalletCache, WalletAccountInfo } from "$utils/wallet_cache.ts";
import { formatXMR } from "$utils/monero.ts";

import { colors } from "../styles.ts";
import { computed, MaybeSignal, signal } from "@tui/signals";
import { cropStart } from "@tui/strings/crop_start";

const AccountButton = createButton((() => {
  const base = new Style({
    width: "100%",
    string: crayon.bgHex(colors.backgroundHigher).hex(colors.text),
    padding: { all: 1 },
    border: {
      left: crayon.hex(colors.monero),
      type: "thick",
    },
    skipIfTooSmall: true,
  });
  const hover = base.derive({
    string: crayon.bgHex(colors.backgroundHighest).hex(colors.textLighter),
  });
  const active = base.derive({
    string: crayon.bgHex(colors.moneroDarker).hex(colors.textLighter),
  });
  return { base, hover, active };
})());

export type AccountBlock = MaybeSignal<StyleBlock>;

const sizeCalc = (width: number) => (width - Math.max(width * 0.1, 30) - 2) * 0.95 - 6;

const width = signal(sizeCalc(Deno.consoleSize().columns));
tui.addEventListener("resize", ({ columns }) => {
  width.set(sizeCalc(columns));
});

export function Account(
  cache: ObservableWalletCache,
  { id, label, address, balance }: WalletAccountInfo,
): AccountBlock {
  const obscuredAddress = address.slice(0, 3) + " ... " + address.slice(-4);

  const block = computed([width], (width) => {
    const blockWidth = Math.floor(width / 3);
    // TODO: Button that can hold custom block instead of just text
    //       What is done now is basically a temporary hack
    const start = cropStart(`#${id} ${label}`, blockWidth).padEnd(blockWidth, " ");
    const middle = cropStart(obscuredAddress, blockWidth).padEnd(blockWidth, " ");
    const end = cropStart(`${formatXMR(balance)} XMR`, blockWidth).padStart(blockWidth, " ");

    return AccountButton(`${start}${middle}${end}`, {
      forceClass: () => cache.currentAccount === id ? "active" : undefined,
      onClick() {
        cache.currentAccount = id;
      },
    });
  });

  return block;
}
