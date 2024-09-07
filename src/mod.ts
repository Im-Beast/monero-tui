import { exists } from "@std/fs/exists";

import { tui } from "@tui/tui";
import { Block, VerticalBlock } from "@tui/nice";
import { computed, signal } from "@tui/signals";
import { crayon } from "@crayon/crayon";

import { Wallet, WalletManager } from "moneroc";

import { getWalletPath } from "$utils/wallet.ts";

import { Introduction } from "./views/IntroductionView.ts";
import { Create } from "./views/CreateView.ts";
import { Restore } from "./views/RestoreView.ts";
import { Open } from "./views/OpenView.ts";
import { Home } from "./views/HomeView.ts";

import { colors } from "./shared/styles.ts";
import { WalletCache } from "$utils/wallet_cache.ts";

export const walletManager = await WalletManager.new();
export const wallet = signal<Wallet | undefined>(undefined);
export const walletCache = computed([wallet], (wallet) => {
  if (wallet) return new WalletCache(wallet);
  return undefined;
});

export type View = "create" | "introduction" | "open" | "restore" | "home" | (() => Block);
export const view = signal<View>("introduction");

const walletExists = await exists(await getWalletPath());
if (walletExists) view.set("open");

tui.render(
  () =>
    new VerticalBlock(
      { width: "100%", height: "100%", string: crayon.bgHex(colors.background).hex(colors.text) },
      computed([view], (view) => {
        switch (view) {
          case "introduction":
            return Introduction();
          case "create":
            return Create();
          case "open":
            return Open();
          case "restore":
            return Restore();
          case "home": {
            const walletValue = wallet.get();
            if (!walletValue) {
              throw new Error("no wallet?");
            }

            const walletCacheValue = walletCache.get()!;

            if (!walletCacheValue.cachesInBackground) {
              tui.sanitizers.push(walletCacheValue.cacheInBackground());
            }

            return Home(walletValue, walletCacheValue);
          }
          default:
            return view();
        }
      }),
    ),
);
