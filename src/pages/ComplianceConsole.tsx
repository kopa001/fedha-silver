import React, { useState } from 'react';
import { useFund } from '../context/FundContext';
import {
  ShieldAlert,
  UserCheck,
  AlertTriangle,
  Lock,
  Unlock,
  Download,
  CheckCircle2,
  Filter
} from 'lucide-react';

export const ComplianceConsole: React.FC = () => {
  const {
    allUsers,
    suspiciousActivityQueue,
    freezeUserAccount,
    unfreezeUserAccount,
    reviewKycTier
  } = useFund();

  const [filterSeverity, setFilterSeverity] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedFreezeUserId, setSelectedFreezeUserId] = useState<string>('');
  const [freezeReason, setFreezeReason] = useState<string>('Unusual structuring velocity');
  const [freezeMessage, setFreezeMessage] = useState<string | null>(null);

  const filteredFlags = suspiciousActivityQueue.filter(
    (item) => filterSeverity === 'all' || item.severity === filterSeverity
  );

  const handleFreeze = (userId: string) => {
    freezeUserAccount(userId, freezeReason);
    setFreezeMessage(`Account for user ${userId} has been frozen.`);
    setTimeout(() => setFreezeMessage(null), 3000);
  };

  const handleUnfreeze = (userId: string) => {
    unfreezeUserAccount(userId);
    setFreezeMessage(`Account for user ${userId} has been unfrozen.`);
    setTimeout(() => setFreezeMessage(null), 3000);
  };

  const handleExportAmlReport = () => {
    const data = {
      complianceDesk: 'FEDHA MMF AML & Regulatory Reporting Desk',
      asOf: new Date().toISOString(),
      flags: suspiciousActivityQueue,
      users: allUsers.map((u) => ({
        id: u.id,
        name: u.name,
        kycTier: u.kycTier,
        isFrozen: u.isFrozen,
        unitBalance: u.unitBalance
      }))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FEDHA_AML_Regulatory_Export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 uppercase">
              Compliance & AML Console
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            KYC Review & Suspicious Activity Desk
          </h2>
          <p className="text-xs text-slate-500">
            Automated structuring detection, velocity guards, and investor sanctions monitoring
          </p>
        </div>

        <button
          onClick={handleExportAmlReport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export AML Regulatory Report</span>
        </button>
      </div>

      {freezeMessage && (
        <div className="p-3 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold">
          {freezeMessage}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-slate-500 block mb-1">Open AML Flags:</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            {suspiciousActivityQueue.filter((f) => f.status === 'open').length} Cases
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-slate-500 block mb-1">Frozen Accounts:</span>
          <span className="text-xl font-bold font-mono text-rose-600">
            {allUsers.filter((u) => u.isFrozen).length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-slate-500 block mb-1">Verified Tier 1/2:</span>
          <span className="text-xl font-bold font-mono text-emerald-600">
            {allUsers.filter((u) => u.kycTier > 0).length} of {allUsers.length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-slate-500 block mb-1">Velocity Limit:</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            Active
          </span>
        </div>
      </div>

      {/* Suspicious Activity Queue */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Suspicious Activity & Structuring Queue
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Filter:</span>
            {(['all', 'high', 'medium', 'low'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2 py-0.5 rounded capitalize ${
                  filterSeverity === sev
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {filteredFlags.map((flag) => {
            const user = allUsers.find((u) => u.id === flag.userId);
            const isUserFrozen = user?.isFrozen;
            return (
              <div key={flag.id} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900 dark:text-white">{flag.userName}</strong>
                    <span className="text-slate-400 font-mono text-[10px]">({flag.userId})</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        flag.severity === 'high'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {flag.severity}
                    </span>
                    {isUserFrozen && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-600 text-white font-bold">
                        FROZEN
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{flag.reason}</p>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Triggered: {flag.timestamp}
                  </span>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {isUserFrozen ? (
                    <button
                      onClick={() => handleUnfreeze(flag.userId)}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                    >
                      Unfreeze
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFreeze(flag.userId)}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700"
                    >
                      Freeze Account
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KYC Tier Reviews Queue */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          Investor Identity & Tier Review
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {allUsers.slice(0, 6).map((u) => (
            <div key={u.id} className="py-2.5 flex items-center justify-between">
              <div>
                <strong className="block text-slate-900 dark:text-white">{u.name}</strong>
                <span className="text-slate-500 font-mono text-[11px]">
                  {u.phone} · Tier {u.kycTier} · Units: {u.unitBalance.toFixed(4)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {u.kycTier < 2 && (
                  <button
                    onClick={() => reviewKycTier(u.id, (u.kycTier + 1) as any)}
                    className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  >
                    Upgrade to Tier {u.kycTier + 1}
                  </button>
                )}
                {u.isFrozen ? (
                  <button
                    onClick={() => handleUnfreeze(u.id)}
                    className="px-2 py-1 rounded border border-rose-300 text-rose-600 font-medium"
                  >
                    Unfreeze
                  </button>
                ) : (
                  <button
                    onClick={() => handleFreeze(u.id)}
                    className="px-2 py-1 rounded border border-slate-200 text-slate-600 font-medium hover:text-rose-600"
                  >
                    Freeze
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
