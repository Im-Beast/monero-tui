import { crayon } from "@crayon/crayon";
import { Style } from "@tui/nice";

import { createButton } from "@tui/tui/components";

import { colors } from "../styles.ts";

const base = new Style({
  string: crayon.bgHex(colors.background).hex(colors.monero),
});

const hover = base.derive({
  string: crayon.bgHex(colors.backgroundHighest).hex(colors.monero),
});

const active = base.derive({
  string: crayon.bgHex(colors.moneroDarker).hex(colors.text),
});

export const SmallButton = createButton({ base, hover, active });
