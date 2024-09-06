import { join } from "@std/path";
import { ensureDir } from "@std/fs";

export async function getWalletDirPath(fileName: string): Promise<string> {
  const OVERWRITE_WALLET_DIR = Deno.env.get("WALLET_DIR");

  if (Deno.build.os === "windows") {
    const mainPath = OVERWRITE_WALLET_DIR ?? Deno.env.get("APPDATA");
    if (!mainPath) throw new Error("shrug");
    walletPath = join(mainPath, "/monero-wallet-tui");
  } else {
    if (OVERWRITE_WALLET_DIR) {
      walletPath = join(OVERWRITE_WALLET_DIR, "/monero-wallet-tui");
    } else {
      const mainPath = Deno.env.get("WALLET_DIR") ?? Deno.env.get("HOME");
      if (!mainPath) throw new Error("shrug");
      walletPath = join(mainPath, "/.config/monero-wallet-tui");
    }
  }

  await ensureDir(walletPath);

  walletPath = join(walletPath, fileName);
  return walletPath;
}

let walletPath: string;
export async function getWalletPath(): Promise<string> {
  if (walletPath) return walletPath;
  walletPath = await getWalletDirPath(Deno.env.get("WALLET_NAME") ?? "main_wallet");
  return walletPath;
}

let unsignedTxPath: string;
export async function getUnsignedTxPath(): Promise<string> {
  if (unsignedTxPath) return unsignedTxPath;
  unsignedTxPath = await getWalletDirPath("unsigned_tx");
  return unsignedTxPath;
}
