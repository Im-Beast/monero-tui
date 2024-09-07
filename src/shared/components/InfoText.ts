import { Style } from "@tui/nice";
import { crayon } from "@crayon/crayon";

import { colors } from "../styles.ts";

const info = new Style({
  string: crayon.hex(colors.info).bgHex(colors.background),
  border: { all: crayon.hex(colors.info).bgHex(colors.background), type: "sharp" },
  text: { horizontalAlign: "center", verticalAlign: "middle" },
  skipIfTooSmall: true,
});

export function InfoText(text: string) {
  return info.create(text);
}

const warning = new Style({
  string: crayon.hex(colors.warning).bgHex(colors.background),
  border: { all: crayon.hex(colors.warning).bgHex(colors.background), type: "sharp" },
  text: { horizontalAlign: "center", verticalAlign: "middle" },
  skipIfTooSmall: true,
});

export function WarningText(text: string) {
  return warning.create(text);
}

const error = new Style({
  string: crayon.hex(colors.error).bgHex(colors.background),
  border: { all: crayon.hex(colors.error).bgHex(colors.background), type: "sharp" },
  text: { horizontalAlign: "center", verticalAlign: "middle" },
  skipIfTooSmall: true,
});

export function ErrorText(text: string) {
  return error.create(text);
}

export function MessageBox(text: string, type: "error" | "warning" | "info") {
  switch (type) {
    case "error":
      return ErrorText(text);
    case "warning":
      return WarningText(text);
    case "info":
      return InfoText(text);
  }
}
