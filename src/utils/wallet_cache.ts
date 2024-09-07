import {
  deepObservableArray,
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

  allTransactions: number;
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
    allTransactions: 0,
    transactions: deepObservableArray([]),
    accounts: shallowObservableArray([]),
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

    {
      const accountsLen = await wallet.numSubaddressAccounts();
      if (cache.accounts.length < accountsLen) {
        for (let i = cache.accounts.length; i < accountsLen; ++i) {
          // TODO: PromiseAll
          const account: WalletAccountInfo = {
            id: i,
            address: await wallet.address(BigInt(i)),
            balance: await wallet.balance(i),
            label: await wallet.getSubaddressLabel(i, 0),
            addresses: [],
          };

          cache.accounts.push(account);
        }
      }
    }

    for (let i = 0; i < cache.accounts.length; ++i) {
      const { addresses } = cache.accounts[i]!;
      const adressesLen = await wallet.numSubaddresses(i);

      if (addresses.length < adressesLen) {
        for (let j = addresses.length; j < adressesLen; ++j) {
          const address: WalletAddressInfo = {
            id: j,
            address: await wallet.address(BigInt(i), BigInt(j)),
            label: await wallet.getSubaddressLabel(i, j),
          };

          addresses.push(address);
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

    const transactionsLen = await history.count();

    for (let i = cache.allTransactions; i < transactionsLen; ++i) {
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

      const transactions = cache.transactions[transactionInfo.account] ??= shallowObservableArray([]);

      transactions.push(transactionInfo);
      transactions.sort((a, b) => a.timestamp < b.timestamp ? 1 : -1);
    }

    cache.allTransactions = transactionsLen;
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
        await PromiseAllObject<Partial<ObservableWalletCache>>({
          // Explicit conversion because of https://github.com/denoland/deno/issues/25194
          balance: wallet.balance(cache.currentAccount).then(BigInt),
          unlockedBalance: wallet.unlockedBalance(cache.currentAccount).then(BigInt),
          synchronized: wallet.synchronized(),
          blockChainHeight: wallet.blockChainHeight().then(BigInt),
          targetBlockChainHeight: wallet.managerTargetBlockChainHeight().then(BigInt),
          daemonblockChainHeight: wallet.daemonBlockChainHeight().then(BigInt),
        }),
      );

      await Promise.all([this.cacheAccounts(), this.cacheTransactions()]);

      if (i > 15 * 10 * 60) { // every 15 min
        await wallet.store();
        i = 0;
      }

      i += 1;
      if (!exit) {
        timeout = setTimeout(run, 100);
      }
    };

    this.cacheAccounts();
    this.cacheTransactions();
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
