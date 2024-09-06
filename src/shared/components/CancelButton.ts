import { Style } from "@tui/nice";
import { crayon } from "@crayon/crayon";

import { createButton } from "@tui/tui/components";

import { colors } from "../styles.ts";

export const CancelButton = createButton((() => {
  const base = new Style({
    string: crayon.bgHex(colors.gray).hex(colors.text),
    padding: { x: 3, y: 1 },
  });

  const hover = base.derive({
    string: crayon.bgHex(colors.grayHigher).hex(colors.text),
  });

  const active = base.derive({
    string: crayon.bgHex(colors.grayHighest).hex(colors.textLighter),
  });
  return { base, hover, active };
})());
