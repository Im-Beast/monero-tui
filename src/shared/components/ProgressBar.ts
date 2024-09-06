import { Style } from "@tui/nice";
import { crayon } from "@crayon/crayon";

import { createProgressBar } from "@tui/tui/components";

import { colors } from "../styles.ts";

export const ProgressBar = createProgressBar((() => {
  const text = new Style({
    width: "100%",
    string: crayon.bgHex(colors.background).hex(colors.text),
    text: {
      horizontalAlign: "center",
      overflow: "ellipsis",
      wrap: "nowrap",
    },
    skipIfTooSmall: true,
  });

  const filled = new Style({
    width: "100%",
    string: crayon.bgHex(colors.backgroundHigher).hex(colors.monero),
    skipIfTooSmall: true,
  });

  return { text, filled };
})());
