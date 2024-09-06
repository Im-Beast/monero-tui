import { crayon } from "@crayon/crayon";
import { Style, StyleBlock } from "@tui/nice";

import { ButtonOptions, createButton } from "@tui/tui/components";
import { colors } from "../styles.ts";

const base = new Style({
  width: (w) => w - 2,
  string: crayon.bgHex(colors.backgroundHigher).hex(colors.text),
  padding: { all: 1 },
  // FIXME: styles not being dynamic?
  border: { left: crayon.hex(colors.monero), type: "thick" },
});

const hover = base.derive({
  string: crayon.bgHex(colors.backgroundHighest).hex(colors.text),
});

const active = base.derive({
  string: crayon.bgHex(colors.moneroDarker).hex(colors.text).bold,
});

export type TabButtonBlock = StyleBlock;

const Button = createButton({ base, hover, active });

export type TabButtonSettings = Exclude<ButtonOptions, "forceClass">;

const selected: Record<string, string> = {};
export function TabButton(text: string, group: string, settings?: TabButtonSettings): TabButtonBlock {
  selected[group] ??= text;

  return Button(text, {
    forceClass: () => {
      return selected[group] === text ? "active" : undefined;
    },
    keybind: settings?.keybind,
    onClick() {
      settings?.onClick?.();
      selected[group] = text;
    },
  });
}
