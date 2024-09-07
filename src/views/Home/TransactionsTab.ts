import { computed } from "@tui/signals";
import { VerticalBlock } from "@tui/nice";

import { ObservableWalletCache } from "$utils/wallet_cache.ts";

import { separatedText, text } from "../../shared/styles.ts";
import { ScrollView, Transaction } from "../../shared/components.ts";

export function TransactionsTab(cache: ObservableWalletCache) {
  const transactions = computed(() => {
    return cache.transactions[cache.currentAccount];
  });

  return new VerticalBlock(
    { id: "transactions-tab", width: "95%", height: "100%", gap: 1 },
    separatedText.create("Transactions"),
    text.create(computed(() => `${transactions.get()?.length ?? 0} transactions total`)),
    //
    computed(() => {
      const txs = transactions.get();

      if (txs?.length) {
        return ScrollView(
          { id: "transactions", width: "100%", height: (h) => h - 8, gap: 1 },
          ...txs.map((transaction) => Transaction(transaction)),
        );
      }

      return text.create("No transactions");
    }),
  );
}
