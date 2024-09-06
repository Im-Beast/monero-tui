import { Style } from "@tui/nice";
import { crayon } from "@crayon/crayon";

import { createButton } from "@tui/tui/components";

import { colors } from "../styles.ts";

export const ActionButton = createButton((() => {
  const base = new Style({
    width: 20,
    height: 3,
    string: crayon.bgHex(colors.monero).hex(colors.text),
    padding: { all: 1 },
    text: {
      verticalAlign: "middle",
      horizontalAlign: "center",
    },
  });
  const hover = base.derive({
    string: crayon.bgHex(colors.moneroDark).hex(colors.text),
  });
  const active = base.derive({
    string: crayon.bgHex(colors.moneroDarker).hex(colors.text),
  });
  return { base, hover, active };
})());
