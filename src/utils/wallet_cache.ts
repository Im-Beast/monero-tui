import {
  deepObservableArray,
  getIntermediate,
  ObservableArray,
  ObservableObject,
  observableObject,
  shallowObservableArray,
} from "@tui/signals";

import { TransactionHistory, Wallet } from "moneroc";

import { PromiseAllObject } from "$utils/promises.ts";

export interface WalletTransactionInfo {
  direction: "in" | "out";
  amount: bigint;
  fee: bigint;

  account: number;
  hash: string;

  timestamp: bigint;
  label: string;
  description: string;

  blockHeight: bigint;
  confirmations: bigint;

  isPending: boolean;
  isFailed: boolean;
  isCoinbase: boolean;
}

export interface WalletAddressInfo {
  id: number;
  label: string;
  address: string;
}

export interface WalletAccountInfo {
  id: number;
  label: string;
  address: string;
  balance: bigint;
  unlockedBalance: bigint;

  addresses: WalletAddressInfo[];
}

export type ObservableWalletCache = ObservableObject<{
  currentAccount: number;

  balance: bigint;
  unlockedBalance: bigint;

  synchronized: boolean;
  blockChainHeight: bigint;
  targetBlockChainHeight: bigint;
  daemonblockChainHeight: bigint;

  transactions: ObservableArray<ObservableArray<WalletTransactionInfo[]>[]>;

  accounts: ObservableArray<WalletAccountInfo[]>;
}>;

export class WalletCache {
  wallet: Wallet;
  #transactionHistory?: TransactionHistory;
  #caches = false;
  #cache: ObservableWalletCache = observableObject({
    currentAccount: 0,
    synchronized: false,
    balance: 0n,
    unlockedBalance: 0n,
    blockChainHeight: 1n,
    targetBlockChainHeight: 1n,
    daemonblockChainHeight: 1n,
    transactions: deepObservableArray([]),
    accounts: deepObservableArray([]),
  });

  constructor(wallet: Wallet) {
    this.wallet = wallet;
  }

  get cache(): ObservableWalletCache {
    return this.#cache;
  }

  get cachesInBackground(): boolean {
    return this.#caches;
  }

  async cacheAccounts(): Promise<void> {
    const { wallet, cache } = this;

    const accountsLen = await wallet.numSubaddressAccounts();
    for (let i = 0; i < accountsLen; ++i) {
      const currentAccount = cache.accounts[i];

      const account: WalletAccountInfo = await PromiseAllObject({
        id: i,
        address: wallet.address(BigInt(i)),
        balance: wallet.balance(i).then(BigInt),
        unlockedBalance: wallet.unlockedBalance(i).then(BigInt),
        label: wallet.getSubaddressLabel(i, 0),
        addresses: currentAccount?.addresses ?? deepObservableArray([]),
      });

      // Only update the account if it actually change to not necessarily propagate changes to signal
      if (
        currentAccount?.balance !== account.balance ||
        currentAccount.label !== account.label
      ) {
        cache.accounts.splice(i, 1, account);
      }
    }

    for (let i = 0; i < cache.accounts.length; ++i) {
      const { addresses } = cache.accounts[i]!;
      const adressesLen = await wallet.numSubaddresses(i);

      for (let j = 0; j < adressesLen; ++j) {
        const currentAddress = addresses[j];
        const address: WalletAddressInfo = await PromiseAllObject({
          id: j,
          address: wallet.address(BigInt(i), BigInt(j)),
          label: wallet.getSubaddressLabel(i, j),
        });

        if (currentAddress?.label !== address.label) {
          addresses[j] = address;
        }
      }
    }
  }

  async cacheTransactions(): Promise<void> {
    const { cache, wallet } = this;

    let history = this.#transactionHistory;
    if (!history) {
      history = await wallet.getHistory();
      this.#transactionHistory = history;
      await wallet.throwIfError();
    }
    await history.refresh();

    const transactionsLen = await history.count();

    const toBeSorted = new Set<WalletTransactionInfo[]>();
    for (let i = 0; i < transactionsLen; ++i) {
      const transaction = await history.transaction(i);

      const transactionInfo = await PromiseAllObject({
        direction: transaction.direction(),
        amount: transaction.amount(),
        fee: transaction.fee(),

        account: transaction.subaddrAccount(),
        hash: transaction.hash(),

        timestamp: transaction.timestamp(),
        label: transaction.label(),
        description: transaction.description(),

        blockHeight: transaction.blockHeight(),
        confirmations: transaction.confirmations(),

        isPending: transaction.isPending(),
        isFailed: transaction.isFailed(),
        isCoinbase: transaction.isCoinbase(),
      });

      const transactions = cache.transactions[transactionInfo.account] ??= deepObservableArray([]);
      const index = transactions.findIndex(({ hash }) => hash === transactionInfo.hash);
      if (index !== -1) {
        const currentTransaction = transactions[index]!;
        if (
          currentTransaction.label !== transactionInfo.label ||
          currentTransaction.description !== transactionInfo.description ||
          currentTransaction.confirmations !== transactionInfo.confirmations
        ) {
          transactions.splice(index, 1, transactionInfo);
        }
      } else {
        transactions.push(transactionInfo);
        toBeSorted.add(transactions);
      }
    }

    for (const transactions of toBeSorted) {
      transactions.sort((a, b) => a.timestamp < b.timestamp ? 1 : -1);
    }
  }

  cacheInBackground(): () => void {
    const { cache, wallet } = this;

    let timeout: number;
    let exit = false;
    this.#caches = true;

    let i = 0;
    const run = async () => {
      Object.assign(
        cache,
        await PromiseAllObject({
          // Explicit conversion because of https://github.com/denoland/deno/issues/25194
          balance: wallet.balance(cache.currentAccount).then(BigInt),
          unlockedBalance: wallet.unlockedBalance(cache.currentAccount).then(BigInt),
          synchronized: wallet.synchronized(),
          blockChainHeight: wallet.blockChainHeight().then(BigInt),
          targetBlockChainHeight: wallet.managerTargetBlockChainHeight().then(BigInt),
          daemonblockChainHeight: wallet.daemonBlockChainHeight().then(BigInt),
        }),
      );

      if (i % 10 === 0) { // Every 1 second
        await this.cacheAccounts();
      }

      if (i % 50 === 0) { // Every 5 seconds
        await this.cacheTransactions();
      }

      if (i > 15 * 10 * 60) { // every 15 min
        await wallet.store();
        i = 0;
      }

      if (!exit) {
        i += 1;
        timeout = setTimeout(run, 100);
      }
    };

    run();

    return (async () => {
      this.#caches = false;
      exit = true;
      clearTimeout(timeout);
      console.log("Saving wallet data, please don't force close the app.");
      await wallet.store();
      console.log("Wallet data saved.");
    });
  }
}
