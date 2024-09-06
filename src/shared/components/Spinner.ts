import { Style } from "@tui/nice";
import { crayon } from "@crayon/crayon";

import { createSpinner } from "@tui/tui/components";

import { colors } from "../styles.ts";

export const Spinner = createSpinner((() => {
  const text = new Style({
    string: crayon.bgHex(colors.background).hex(colors.text),
    text: {
      horizontalAlign: "center",
      overflow: "ellipsis",
      wrap: "nowrap",
    },
    skipIfTooSmall: true,
  });

  const spinner = new Style({
    string: crayon.bgHex(colors.background).hex(colors.monero),
    skipIfTooSmall: true,
  });

  return { text, spinner };
})());
