import { crayon } from "@crayon/crayon";
import { Style } from "@tui/nice";

import { ColorSupport, getColorSupport } from "@crayon/color-support";
import "@crayon/literal";
crayon.colorSupport = await getColorSupport(ColorSupport.HighColor);

export const colors = {
  gray: 0x343434,
  grayHigher: 0x484848,
  grayHighest: 0x646464,

  monero: 0xf26822,
  moneroDark: 0x913608,
  moneroDarker: 0x301203,

  background: 0x000000,
  backgroundHigher: 0x101010,
  backgroundHighest: 0x252525,

  placeholder: 0x909090,

  text: 0xffffff,
  textLighter: 0xffffff,

  error: 0xFF0000,
  warning: 0xFFFF00,
  info: 0x0080FF,
};

export const text = new Style({ string: crayon.white });
export const boldText = new Style({ string: crayon.bold.white });
export const separatedText = boldText.derive({
  width: "100%",
  border: { bottom: crayon.white, type: "thick" },
});
