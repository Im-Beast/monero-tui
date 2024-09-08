import { crayon } from "@crayon/crayon";
import { HorizontalBlock, Style } from "@tui/nice";

import { WalletAddressInfo } from "$utils/wallet_cache.ts";
import { copyToClipboard } from "$utils/clipboard.ts";

import { colors } from "../styles.ts";
import { Button } from "../components.ts";

const edge = new Style({
  width: (w) => Math.floor((w - 20) / 2),
  string: crayon.bgHex(colors.backgroundHigher).hex(colors.textLighter),
  padding: { all: 1 },
  border: {
    left: crayon.hex(colors.monero),
    type: "thick",
  },
  skipIfTooSmall: true,
});

const block = new Style({
  width: (w) => Math.round((w - 20) / 2),
  string: crayon.bgHex(colors.backgroundHigher).hex(colors.textLighter),
  padding: { y: 1, left: 1, right: 3 },
  skipIfTooSmall: true,
  text: {
    horizontalAlign: "left",
  },
});

export type AddressBlock = HorizontalBlock;

export function Address({ id, label, address }: WalletAddressInfo): AddressBlock {
  const obscuredAddress = address.slice(0, 3) + " ... " + address.slice(-4);

  return new HorizontalBlock(
    { id: label, width: "100%", string: crayon.bgHex(colors.backgroundHigher) },
    edge.create(`#${id} ${label}`),
    block.create(obscuredAddress),
    Button("Copy address", {
      onClick() {
        copyToClipboard(address);
      },
    }),
  );
}
