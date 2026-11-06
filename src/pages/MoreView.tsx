import React, { useState } from 'react';
import { useFund } from '../context/FundContext';
import {
  ShieldCheck,
  Bell,
  FileText,
  Lock,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const MoreView: React.FC = () => {
  const { currentUser, notices, alerts, addNavAlert, reviewKycTier } = useFund();

  const [alertType, setAlertType] = useState<'above' | 'below' | 'pct_move'>('pct_move');
  const [alertThreshold, setAlertThreshold] = useState<string>('2.0');
  const [alertCreatedMessage, setAlertCreatedMessage] = useState<string | null>(null);
  const [idNumberInput, setIdNumberInput] = useState<string>('28491023');
  const [kycSuccessMessage, setKycSuccessMessage] = useState<string | null>(null);

  const handleCreateAlert = () => {
    const val = parseFloat(alertThreshold) || 0;
    if (val > 0) {
      addNavAlert(alertType, val);
      setAlertCreatedMessage(`Alert created: notify when daily NAV ${alertType.replace('_', ' ')} ${val}`);
      setTimeout(() => setAlertCreatedMessage(null), 3500);
    }
  };

  const handleKycUpgrade = () => {
    if (currentUser.kycTier === 0) {
      reviewKycTier(currentUser.id, 1);
      setKycSuccessMessage('Upgraded to Tier 1 KYC with National ID verification!');
    } else if (currentUser.kycTier === 1) {
      reviewKycTier(currentUser.id, 2);
      setKycSuccessMessage('Upgraded to Tier 2 KYC (Enhanced Verification)!');
    }
    setTimeout(() => setKycSuccessMessage(null), 3500);
  };

  const handleExportMyData = () => {
    const data = {
      user: currentUser,
      exportTimestamp: new Date().toISOString(),
      regulatorCompliance: 'Kenya Data Protection Act 2019 Section 26 Access Rights'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FEDHA_Investor_Data_${currentUser.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Account & Fund Settings
        </h2>
        <p className="text-xs text-slate-500">
          KYC verification, NAV price alert triggers, statutory fund notices, and privacy
        </p>
      </div>

      {/* KYC Tier Status Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              KYC Verification Level: Tier {currentUser.kycTier}
            </h3>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            {currentUser.kycTier === 0 ? 'Tier 0 (Starter)' : currentUser.kycTier === 1 ? 'Tier 1 (Verified ID)' : 'Tier 2 (Enhanced)'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className={`p-3 rounded-xl border ${currentUser.kycTier >= 0 ? 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-medium' : 'opacity-60'}`}>
            <strong className="block text-slate-900 dark:text-white">Tier 0 (Phone/Email)</strong>
            <span className="text-slate-500 text-[11px]">Daily cap: KSh 10,000</span>
          </div>
          <div className={`p-3 rounded-xl border ${currentUser.kycTier >= 1 ? 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-medium' : 'opacity-60'}`}>
            <strong className="block text-slate-900 dark:text-white">Tier 1 (National ID)</strong>
            <span className="text-slate-500 text-[11px]">Daily cap: KSh 150,000 · Physical bar pickup enabled</span>
          </div>
          <div className={`p-3 rounded-xl border ${currentUser.kycTier >= 2 ? 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-medium' : 'opacity-60'}`}>
            <strong className="block text-slate-900 dark:text-white">Tier 2 (Enhanced)</strong>
            <span className="text-slate-500 text-[11px]">Full institutional & high-value limits</span>
          </div>
        </div>

        {kycSuccessMessage && (
          <p className="text-xs text-emerald-600 font-semibold">{kycSuccessMessage}</p>
        )}

        {currentUser.kycTier < 2 && (
          <button
            onClick={handleKycUpgrade}
            className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 transition"
          >
            Upgrade to Tier {currentUser.kycTier + 1}
          </button>
        )}
      </div>

      {/* NAV Price Alerts */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            NAV Price Alerts (In-App / Email)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="sm:col-span-2 flex gap-2">
            <select
              value={alertType}
              onChange={(e) => setAlertType(e.target.value as any)}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-medium"
            >
              <option value="pct_move">Daily move exceeds (%)</option>
              <option value="above">NAV rises above (KSh)</option>
              <option value="below">NAV falls below (KSh)</option>
            </select>
            <input
              type="number"
              step="0.1"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(e.target.value)}
              className="w-24 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-mono font-bold"
            />
          </div>
          <button
            onClick={handleCreateAlert}
            className="py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs"
          >
            Set Alert
          </button>
        </div>

        {alertCreatedMessage && (
          <p className="text-xs text-emerald-600 font-semibold">{alertCreatedMessage}</p>
        )}

        {/* Active alerts */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Active Configured Alerts
          </span>
          <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            {alerts.map((alt) => (
              <div key={alt.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                <span>
                  Notify when NAV {alt.type.replace('_', ' ')}: <strong>{alt.thresholdValue}</strong>
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">ACTIVE</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Official Fund Notices */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          Official Fund Notices & Bulletins
        </h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {notices.map((n) => (
            <div key={n.id} className="py-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">{n.title}</span>
                <span className="text-[10px] text-slate-400 font-mono">{n.publishedAt}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{n.content}</p>
              <span className="text-[10px] text-slate-400 block">Issued by: {n.author}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Protection & Privacy (Kenya Data Protection Act 2019) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          Data Privacy (Kenya Data Protection Act 2019)
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          You have the statutory right under the Data Protection Act to access and export all personal data held by FEDHA Silver MMF. Financial transaction records are retained in compliance with CMA regulatory audit retention obligations (7 years).
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={handleExportMyData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export My Data (JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
