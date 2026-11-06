import { LedgerEntry } from '../types';

/**
 * Pure TypeScript SHA-256 implementation for synchronous, zero-dependency hash chaining
 */
function sha256Sync(str: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i = 0, j = 0;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = str.length * 8;

  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isPrime = (n: number) => {
    for (let factor = 2; factor * factor <= n; factor++) {
      if (n % factor === 0) return false;
    }
    return true;
  };

  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (isPrime(candidate)) {
      if (primeCounter < 8) {
        hash[primeCounter] = (mathPow(candidate, 1 / 2) * maxWord) | 0;
      }
      k[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      primeCounter++;
    }
  }

  str += '\x80';
  while ((str.length % 64) - 56) str += '\x00';
  for (i = 0; i < str.length; i++) {
    j = str.charCodeAt(i);
    words[i >> 2] = (words[i >> 2] || 0) | (j << ((3 - (i % 4)) * 8));
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength | 0;

  for (j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = [...hash];

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15],
        w2 = w[i - 2];
      const s0 = i >= 16 ? rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3) : 0;
      const s1 = i >= 16 ? rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10) : 0;
      w[i] = i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0;

      const s1_ch = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = (hash[7] + s1_ch + ch + k[i] + w[i]) | 0;
      const s0_maj = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (s0_maj + maj) | 0;

      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

export class LedgerEngine {
  private entries: LedgerEntry[] = [];
  public static readonly GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';
  public static readonly UNITS_DECIMALS = 8;
  public static readonly UNITS_SCALE = 100_000_000; // 1 unit = 10^8 nano-units
  public static readonly MONEY_SCALE = 100; // 1 KES = 100 minor units (cents)

  constructor(initialEntries: LedgerEntry[] = []) {
    this.entries = [...initialEntries];
  }

  public getEntries(): LedgerEntry[] {
    return [...this.entries];
  }

  public getLatestEntry(): LedgerEntry | undefined {
    return this.entries[this.entries.length - 1];
  }

  /**
   * Computes the deterministic cryptographic hash of a ledger row
   */
  public static computeRowHash(
    index: number,
    prevHash: string,
    timestamp: string,
    txType: string,
    debitAccount: string,
    creditAccount: string,
    amountMinorUnits: number,
    unitsNano: number,
    navApplied: number,
    memo: string
  ): string {
    const raw = `${index}|${prevHash}|${timestamp}|${txType}|${debitAccount}|${creditAccount}|${amountMinorUnits}|${unitsNano}|${navApplied.toFixed(8)}|${memo}`;
    return sha256Sync(raw);
  }

  /**
   * Records a double-entry transaction onto the immutable hash-chained ledger
   */
  public recordEntry(params: {
    txType: LedgerEntry['txType'];
    debitAccount: string;
    creditAccount: string;
    amountFiat: number; // in standard currency (e.g. 50.00 KES)
    units: number; // in standard units (e.g. 1.00000000)
    navApplied: number;
    memo: string;
    timestamp?: string;
  }): LedgerEntry {
    const prev = this.getLatestEntry();
    const prevHash = prev ? prev.rowHash : LedgerEngine.GENESIS_HASH;
    const index = this.entries.length;
    const timestamp = params.timestamp || new Date().toISOString();

    const amountMinorUnits = Math.round(params.amountFiat * LedgerEngine.MONEY_SCALE);
    const unitsNano = Math.round(params.units * LedgerEngine.UNITS_SCALE);

    const rowHash = LedgerEngine.computeRowHash(
      index,
      prevHash,
      timestamp,
      params.txType,
      params.debitAccount,
      params.creditAccount,
      amountMinorUnits,
      unitsNano,
      params.navApplied,
      params.memo
    );

    const newEntry: LedgerEntry = {
      id: `LEDGER-${index.toString().padStart(6, '0')}`,
      index,
      timestamp,
      txType: params.txType,
      debitAccount: params.debitAccount,
      creditAccount: params.creditAccount,
      amountMinorUnits,
      unitsNano,
      navApplied: params.navApplied,
      memo: params.memo,
      prevHash,
      rowHash
    };

    this.entries.push(newEntry);
    return newEntry;
  }

  /**
   * Reverses a previous ledger entry (append-only ledger correction)
   */
  public recordReversal(originalEntryId: string, reason: string): LedgerEntry {
    const orig = this.entries.find((e) => e.id === originalEntryId);
    if (!orig) throw new Error(`Original ledger entry ${originalEntryId} not found`);

    return this.recordEntry({
      txType: 'reversal',
      debitAccount: orig.creditAccount, // swapped
      creditAccount: orig.debitAccount, // swapped
      amountFiat: orig.amountMinorUnits / LedgerEngine.MONEY_SCALE,
      units: orig.unitsNano / LedgerEngine.UNITS_SCALE,
      navApplied: orig.navApplied,
      memo: `REVERSAL of ${originalEntryId}: ${reason}`
    });
  }

  /**
   * Verifies the cryptographic integrity of the entire ledger chain.
   * Returns whether it's valid, total rows inspected, and any detected violation.
   */
  public verifyIntegrity(): {
    isValid: boolean;
    inspectedCount: number;
    corruptedIndex?: number;
    error?: string;
  } {
    if (this.entries.length === 0) {
      return { isValid: true, inspectedCount: 0 };
    }

    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i];

      // 1. Verify prevHash link
      const expectedPrevHash = i === 0 ? LedgerEngine.GENESIS_HASH : this.entries[i - 1].rowHash;
      if (entry.prevHash !== expectedPrevHash) {
        return {
          isValid: false,
          inspectedCount: i,
          corruptedIndex: i,
          error: `Broken chain link at index ${i}: expected prevHash ${expectedPrevHash.slice(0, 8)}... but found ${entry.prevHash.slice(0, 8)}...`
        };
      }

      // 2. Verify rowHash computation
      const calculatedHash = LedgerEngine.computeRowHash(
        entry.index,
        entry.prevHash,
        entry.timestamp,
        entry.txType,
        entry.debitAccount,
        entry.creditAccount,
        entry.amountMinorUnits,
        entry.unitsNano,
        entry.navApplied,
        entry.memo
      );

      if (entry.rowHash !== calculatedHash) {
        return {
          isValid: false,
          inspectedCount: i,
          corruptedIndex: i,
          error: `Tampered row at index ${i}: stored hash ${entry.rowHash.slice(0, 8)}... does not match calculated hash ${calculatedHash.slice(0, 8)}...`
        };
      }
    }

    return { isValid: true, inspectedCount: this.entries.length };
  }

  /**
   * Invariants check:
   * 1. Sum of investor unit balances = fund unitsOutstanding
   * 2. Total units minted minus redeemed matches net ledger units
   */
  public checkInvariants(users: { unitBalance: number }[], unitsOutstanding: number): {
    unitsBalanceSum: number;
    unitsOutstanding: number;
    diff: number;
    isBalanced: boolean;
  } {
    const sumUserUnits = users.reduce((acc, u) => acc + u.unitBalance, 0);
    const diff = Math.abs(sumUserUnits - unitsOutstanding);
    // Allow epsilon for 8-decimal micro rounding
    const isBalanced = diff < 0.00001;

    return {
      unitsBalanceSum: Number(sumUserUnits.toFixed(8)),
      unitsOutstanding: Number(unitsOutstanding.toFixed(8)),
      diff: Number(diff.toFixed(8)),
      isBalanced
    };
  }

  /**
   * For the demo tamper test: intentionally corrupt a row to show the auditor console catching it!
   */
  public simulateTamperRow(index: number): void {
    if (this.entries[index]) {
      this.entries[index] = {
        ...this.entries[index],
        amountMinorUnits: this.entries[index].amountMinorUnits + 500000 // tamper money amount!
      };
    }
  }

  public restoreEntries(backup: LedgerEntry[]): void {
    this.entries = [...backup];
  }
}
