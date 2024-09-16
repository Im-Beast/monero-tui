import { tui } from "@tui/tui";

const textEncoder = new TextEncoder();

export async function copyToClipboard(value: string): Promise<void> {
  // Default Apple Terminal does not support clipboard related ansi sequences,
  // so we fallback to using pbcopy.
  // iTerm.app and other terminals seem to work just fine though
  if (Deno.env.get("TERM_PROGRAM") === "Apple_Terminal") {
    const pbcopy = new Deno.Command("pbcopy", { stdin: "piped" }).spawn();

    const writer = pbcopy.stdin.getWriter();
    writer.write(textEncoder.encode(value));
    writer.close();

    await pbcopy.output()
    return;
  }

  const encodedValue = btoa(value);
  await tui.writer.write(textEncoder.encode(`\x1b]52;c;${encodedValue}\x07`));
}
