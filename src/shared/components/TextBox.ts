import { Style } from "@tui/nice";
import { crayon } from "@crayon/crayon";
import { createTextBox } from "@tui/tui/components";

import { colors } from "../styles.ts";

export const TextBox = createTextBox((() => {
  const base = new Style({
    width: "100%",
    string: crayon.bgHex(colors.backgroundHigher).hex(colors.text),
    text: {
      wrap: "nowrap",
    },
    border: {
      all: crayon.hex(colors.text),
      type: "rounded",
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
    width: 1,
    height: 1,
    string: crayon.bgHex(colors.monero).hex(colors.text),
  });

  return { base, hover, active, cursor };
})());
