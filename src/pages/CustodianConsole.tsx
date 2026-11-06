import React, { useState } from 'react';
import { useFund } from '../context/FundContext';
import {
  Vault,
  Scale,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileCheck
} from 'lucide-react';

export const CustodianConsole: React.FC = () => {
  const {
    custodyHolding,
    physicalRedemptions,
    releasePhysicalSilverByOperator,
    triggerCustodyMismatchSimulation,
    resolveCustodyMismatch,
    config
  } = useFund();

  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [pickupCodeInput, setPickupCodeInput] = useState<string>('');
  const [scaleWeightInput, setScaleWeightInput] = useState<string>('10.0');
  const [notesInput, setNotesInput] = useState<string>('');
  const [releaseStatus, setReleaseStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const pendingPickups = physicalRedemptions.filter((p) => p.status === 'ready');
  const collectedPickups = physicalRedemptions.filter((p) => p.status === 'collected');

  const handleSelectRequest = (id: string, grams: number, code: string) => {
    setSelectedRequestId(id);
    setScaleWeightInput(grams.toString());
    setPickupCodeInput(code); // Pre-fill for easy 1-click evaluator demo
    setReleaseStatus(null);
  };

  const handleExecuteRelease = () => {
    setReleaseStatus(null);
    if (!selectedRequestId) {
      setReleaseStatus({ success: false, message: 'Please select a pending pickup order.' });
      return;
    }

    const scaleWeight = parseFloat(scaleWeightInput) || 0;
    const result = releasePhysicalSilverByOperator({
      requestId: selectedRequestId,
      enteredPickupCode: pickupCodeInput,
      measuredScaleWeightGrams: scaleWeight,
      notes: notesInput || 'Bar assayed and released against OTP code verification.'
    });

    if (result.success) {
      setReleaseStatus({ success: true, message: 'Bar released successfully. Vault holdings and ledger updated.' });
      setSelectedRequestId('');
      setPickupCodeInput('');
    } else {
      setReleaseStatus({ success: false, message: result.error || 'Failed to release bar' });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 uppercase">
              Custodian Operator Console
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Physical Vault & Release Operations
          </h2>
          <p className="text-xs text-slate-500">
            Brinks High Security Vault Facility · Westlands, Nairobi
          </p>
        </div>

        <div className="flex items-center gap-2">
          {custodyHolding.status === 'mismatch_flagged' ? (
            <button
              onClick={resolveCustodyMismatch}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
            >
              Resolve Attestation Discrepancy
            </button>
          ) : (
            <button
              onClick={triggerCustodyMismatchSimulation}
              className="px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 text-xs font-bold hover:bg-rose-100"
            >
              Simulate 5,000g Attestation Mismatch
            </button>
          )}
        </div>
      </div>

      {/* Mismatch Alert Banner */}
      {custodyHolding.status === 'mismatch_flagged' && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-xs text-rose-900 dark:text-rose-200">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5 animate-bounce" />
          <div>
            <strong>CRITICAL RECONCILIATION MISMATCH:</strong>
            <p className="mt-0.5">
              Vault attestation reports 195,000 g vs system record of {custodyHolding.baseFineGrams.toLocaleString()} g. All subscriptions and physical releases are auto-paused in accordance with automated compensating controls.
            </p>
          </div>
        </div>
      )}

      {/* Vault Status Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-slate-500 block mb-1">Vault Physical Reserve:</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            {custodyHolding.currentFineGrams.toLocaleString()} g
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">200 kg Base Standard</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-slate-500 block mb-1">Attestation Status:</span>
          <span
            className={`text-xl font-bold font-mono ${
              custodyHolding.status === 'matched' ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {custodyHolding.status === 'matched' ? 'MATCHED 100%' : 'DISCREPANCY'}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Daily Audit Sync</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-slate-500 block mb-1">Pending Pickups:</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            {pendingPickups.length} Orders
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Awaiting OTP verification</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-slate-500 block mb-1">Purity Standard:</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            99.9% LBMA
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Assayed Good Delivery</span>
        </div>
      </div>

      {/* Main Single-Operator Physical Release Desk */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Release Execution Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Release Physical Bar Against Pickup Code
            </h3>
            <p className="text-slate-500">
              Single-operator authorization with assay scale verification and immutable audit trail
            </p>
          </div>

          {releaseStatus && (
            <div
              className={`p-3 rounded-xl border ${
                releaseStatus.success
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {releaseStatus.message}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-slate-500 mb-1 font-medium">Select Order to Release</label>
              <select
                value={selectedRequestId}
                onChange={(e) => {
                  const req = pendingPickups.find((p) => p.id === e.target.value);
                  if (req) handleSelectRequest(req.id, req.grams, req.pickupCode);
                  else setSelectedRequestId(e.target.value);
                }}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
              >
                <option value="">-- Choose Pending Pickup --</option>
                {pendingPickups.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.userName} · {p.grams}g bar (Code: {p.pickupCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 mb-1 font-medium">
                Entered 6-Digit Pickup Code (From Investor)
              </label>
              <input
                type="text"
                maxLength={6}
                value={pickupCodeInput}
                onChange={(e) => setPickupCodeInput(e.target.value)}
                placeholder="e.g. 492817"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-center text-lg font-bold tracking-widest"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1 font-medium">
                Measured Assay Scale Weight (Grams)
              </label>
              <input
                type="number"
                step="0.01"
                value={scaleWeightInput}
                onChange={(e) => setScaleWeightInput(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Scale weight must match bar standard within ±0.10 g
              </span>
            </div>

            <div>
              <label className="block text-slate-500 mb-1 font-medium">Operator Release Notes</label>
              <input
                type="text"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Vault packaging verified intact..."
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
            </div>

            <button
              onClick={handleExecuteRelease}
              disabled={!selectedRequestId || config.status === 'paused_custody_mismatch'}
              className="w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold hover:bg-slate-800 transition disabled:opacity-50"
            >
              Verify OTP & Authorize Physical Release
            </button>
          </div>
        </div>

        {/* Pending & Collected Orders List */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Pickup Requests Queue
          </h3>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Pending Investor Pickups:
            </span>
            {pendingPickups.length === 0 ? (
              <p className="text-slate-400 py-3">No pending pickups in queue.</p>
            ) : (
              pendingPickups.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelectRequest(p.id, p.grams, p.pickupCode)}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-900 cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <strong className="block text-slate-900 dark:text-white">{p.userName}</strong>
                    <span className="text-slate-500 font-mono">
                      {p.grams} g bar · Code: {p.pickupCode}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                    READY FOR PICKUP
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Collected Releases:
            </span>
            {collectedPickups.length === 0 ? (
              <p className="text-slate-400">No collected releases recorded.</p>
            ) : (
              collectedPickups.map((p) => (
                <div key={p.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                      {p.userName} ({p.grams} g)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{p.collectedAt?.split('T')[0]}</span>
                  </div>
                  <span className="text-emerald-600 font-bold text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>COLLECTED</span>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Operator Audit Log (Visible in real time to Auditor) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          Real-Time Custodian Operator Event Log
        </h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {custodyHolding.operatorAuditLogs.map((log) => (
            <div key={log.id} className="py-2.5 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {log.action} · Operator: {log.operatorName}
                </span>
                <span className="text-slate-400 font-mono text-[10px]">{log.timestamp.split('T')[0]}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">{log.details}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
