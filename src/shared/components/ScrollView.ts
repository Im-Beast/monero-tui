import { crayon } from "@crayon/crayon";
import { Style } from "@tui/nice";

import { createScrollView } from "@tui/tui/components";

import { colors } from "../styles.ts";

export const ScrollView = createScrollView((() => {
  const scrollbar = new Style({
    width: 2,
    margin: { left: 1 },
    string: crayon.bgHex(colors.monero).hex(colors.text),
  });
  return scrollbar;
})());
