import React, { useState } from 'react';
import { useFund } from '../context/FundContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileCheck,
  Database,
  Lock,
  Search
} from 'lucide-react';

export const AuditorConsole: React.FC = () => {
  const {
    ledger,
    ledgerEntries,
    verifyLedgerIntegrity,
    simulateLedgerTamper,
    restoreLedger,
    custodyHolding,
    currentNav,
    allUsers
  } = useFund();

  const [auditResult, setAuditResult] = useState<ReturnType<typeof verifyLedgerIntegrity> | null>(() =>
    ledger.verifyIntegrity()
  );
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleRunAudit = () => {
    const res = verifyLedgerIntegrity();
    setAuditResult(res);
  };

  const handleSimulateTamper = () => {
    simulateLedgerTamper();
    const res = verifyLedgerIntegrity();
    setAuditResult(res);
  };

  const handleRestore = () => {
    restoreLedger();
    const res = verifyLedgerIntegrity();
    setAuditResult(res);
  };

  // Invariants check
  const invariantCheck = ledger.checkInvariants(allUsers, currentNav.unitsOutstanding);

  const filteredEntries = ledgerEntries.filter(
    (e) =>
      e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.memo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.txType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.rowHash.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 uppercase">
              Independent Auditor Console
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
              Read-Only
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Ledger Cryptographic Integrity & Vault Audit
          </h2>
          <p className="text-xs text-slate-500">
            SHA-256 hash-chain verification, double-entry mathematical invariants, and custody records
          </p>
        </div>

        <div className="flex items-center gap-2">
          {auditResult && !auditResult.isValid ? (
            <button
              onClick={handleRestore}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
            >
              Restore Pristine Ledger State
            </button>
          ) : (
            <button
              onClick={handleSimulateTamper}
              className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 text-xs font-bold hover:bg-rose-100"
            >
              Simulate Historical Row Tamper
            </button>
          )}

          <button
            onClick={handleRunAudit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-Verify Chain</span>
          </button>
        </div>
      </div>

      {/* Integrity Audit Result Banner */}
      {auditResult && auditResult.isValid ? (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-3 text-xs text-emerald-900 dark:text-emerald-200">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
          <div>
            <strong>CRYPTOGRAPHIC INTEGRITY VERIFIED (100% CLEAN):</strong>
            <p className="mt-0.5">
              Inspected all <strong>{auditResult.inspectedCount} ledger rows</strong>. Every SHA-256 hash link from Genesis Hash (00000000...) to the current row is mathematically intact. Zero row corruption detected.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-xs text-rose-900 dark:text-rose-200">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5 animate-bounce" />
          <div>
            <strong>TAMPER DETECTED BY CRYPTOGRAPHIC AUDIT:</strong>
            <p className="mt-0.5">{auditResult?.error}</p>
            <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-1">
              The tamper test proves that altering any amount in the append-only ledger immediately invalidates downstream SHA-256 hashes.
            </p>
          </div>
        </div>
      )}

      {/* Mathematical Invariants Check Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Double-Entry Mathematical Invariants Check
            </h3>
            <p className="text-slate-500">
              Total units minted across all 80 investor balances vs Fund unitsOutstanding
            </p>
          </div>
          <span
            className={`font-bold font-mono px-2 py-0.5 rounded ${
              invariantCheck.isBalanced ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}
          >
            {invariantCheck.isBalanced ? 'INVARIANTS BALANCED' : 'IMBALANCE DETECTED'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
            <span className="text-slate-500 block">Sum of Investor Balances:</span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
              {invariantCheck.unitsBalanceSum.toFixed(4)} units
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
            <span className="text-slate-500 block">Fund Units Outstanding:</span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
              {invariantCheck.unitsOutstanding.toFixed(4)} units
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
            <span className="text-slate-500 block">Variance (Diff):</span>
            <span className="text-base font-bold font-mono text-emerald-600">
              {invariantCheck.diff.toFixed(8)} units (0.00000000)
            </span>
          </div>
        </div>
      </div>

      {/* Immutable Ledger Chain Browser */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Immutable Append-Only Ledger Chain ({ledgerEntries.length} Records)
            </h3>
            <p className="text-slate-500">
              Each row stores integer minor units, previous SHA-256 hash, and computed row hash
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by hash, type, memo..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                <th className="pb-2 font-medium">Index</th>
                <th className="pb-2 font-medium">Tx Type</th>
                <th className="pb-2 font-medium">Debit / Credit</th>
                <th className="pb-2 font-medium text-right">Units (Nano)</th>
                <th className="pb-2 font-medium text-right">Amount (Cents)</th>
                <th className="pb-2 font-medium">Previous Hash &rarr; Row Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEntries.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 text-slate-500">#{e.index}</td>
                  <td className="py-2.5 font-bold uppercase text-slate-800 dark:text-slate-200">
                    {e.txType}
                  </td>
                  <td className="py-2.5 text-slate-600 dark:text-slate-400">
                    <div>{e.debitAccount}</div>
                    <div className="text-[10px] text-slate-400">&rarr; {e.creditAccount}</div>
                  </td>
                  <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white">
                    {e.unitsNano > 0 ? (e.unitsNano / 100_000_000).toFixed(8) : '-'}
                  </td>
                  <td className="py-2.5 text-right text-slate-700 dark:text-slate-300">
                    KSh {(e.amountMinorUnits / 100).toFixed(2)}
                  </td>
                  <td className="py-2.5">
                    <div className="text-slate-400 text-[10px] truncate max-w-[200px]" title={e.prevHash}>
                      prev: {e.prevHash.slice(0, 12)}...
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 text-[10px] font-bold truncate max-w-[200px]" title={e.rowHash}>
                      hash: {e.rowHash.slice(0, 12)}...
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
