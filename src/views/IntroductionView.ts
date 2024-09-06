import { crayon } from "@crayon/crayon";
import { HorizontalBlock, Style, VerticalBlock } from "@tui/nice";
import { createButton } from "@tui/tui/components";

import { colors, separatedText } from "../shared/styles.ts";
import { view } from "../mod.ts";

const Button = createButton((() => {
  const base = new Style({
    width: "50%",
    height: "100%",
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

export function Introduction() {
  return new VerticalBlock(
    { id: "introduction-view", width: "100%", height: "100%" },
    separatedText.create("Welcome to Monero TUI, What would you like to do?"),
    new HorizontalBlock(
      {
        width: "100%",
        height: (h) => h - 2,
        x: "50%",
        gap: 1,
        string: crayon.bgHex(colors.background),
      },
      Button("Create a new wallet", {
        onClick: () => view.set("create"),
      }),
      Button("Restore wallet", {
        onClick: () => view.set("restore"),
      }),
    ),
  );
}
