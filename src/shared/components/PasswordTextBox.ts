import { Style } from "@tui/nice";
import { crayon } from "@crayon/crayon";
import { createTextBox } from "@tui/tui/components";

import { colors } from "../styles.ts";

export const PasswordTextBox = createTextBox((() => {
  const base = new Style({
    width: (w) => w - 2,
    string: crayon.bgHex(colors.backgroundHigher).hex(colors.text),
    padding: { all: 1 },
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
    string: crayon.bgHex(colors.monero).hex(colors.text),
  });
  return { base, hover, active, cursor };
})());
