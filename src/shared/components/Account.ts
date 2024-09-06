import { crayon } from "@crayon/crayon";
import { Style, StyleBlock } from "@tui/nice";

import { createButton } from "@tui/tui/components";

import { ObservableWalletCache, WalletAccountInfo } from "$utils/wallet_cache.ts";
import { formatXMR } from "$utils/monero.ts";

import { colors } from "../styles.ts";

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

export type AccountBlock = StyleBlock;

export function Account(
  cache: ObservableWalletCache,
  { id, label, address, balance }: WalletAccountInfo,
): AccountBlock {
  const obscuredAddress = address.slice(0, 3) + " ... " + address.slice(-4);

  const block = AccountButton(
    `#${id} ${label.padEnd(18, " ")} ${obscuredAddress.padEnd(15, " ")} ${formatXMR(balance)} XMR`,
    {
      forceClass: () => cache.currentAccount === id ? "active" : undefined,
      onClick() {
        cache.currentAccount = id;
      },
    },
  );

  return block;
}
