import { tui } from "@tui/tui";

const textEncoder = new TextEncoder();

export async function copyToClipboard(value: string): Promise<void> {
  const encodedValue = btoa(value);
  await tui.writer.write(textEncoder.encode(`\x1b]52;c;${encodedValue}\x07`));
}
