import React, { useState } from 'react';
import { useFund } from '../context/FundContext';
import {
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  Zap,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  Sliders,
  Clock,
  Settings
} from 'lucide-react';

export const AdminConsole: React.FC = () => {
  const {
    config,
    updateConfig,
    currentNav,
    runDailyStrike,
    ratios,
    custodyHolding,
    triggerCircuitBreakerSimulation,
    resetCircuitBreaker,
    verifyLedgerIntegrity
  } = useFund();

  const [strikeNote, setStrikeNote] = useState<string>('Daily 17:00 EAT market strike');
  const [strikeExecutedMessage, setStrikeExecutedMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'strike' | 'controls' | 'checklist'>('strike');

  // Regulatory Checklist items
  const [checklist, setChecklist] = useState<Array<{ id: string; label: string; checked: boolean; details: string }>>([
    {
      id: 'cma_license',
      label: 'Capital Markets Authority (CMA) CIS Approval',
      checked: false,
      details: 'Obtain Collective Investment Scheme / Money Market Fund registration under CMA Act Cap 485A.'
    },
    {
      id: 'custodian_trustee',
      label: 'Licensed Trustee & Custodian Appointment',
      checked: true,
      details: 'Brinks Vault & Standard Custody Kenya appointed under trust deed.'
    },
    {
      id: 'vault_insurance',
      label: '100% Silver Bullion Replacement Insurance',
      checked: true,
      details: 'Lloyds of London Syndicate #4421 policy active for 200 kg physical silver.'
    },
    {
      id: 'aml_cft',
      label: 'AML/CFT & Proceeds of Crime Compliance',
      checked: true,
      details: 'Tiered KYC rules, velocity limits, and suspicious activity flagging implemented.'
    },
    {
      id: 'payments_partner',
      label: 'CBK Licensed Payment Service Provider (PSP)',
      checked: false,
      details: 'Requires formal integration with a licensed PSP for real M-Pesa / RTGS fiat rails.'
    },
    {
      id: 'data_protection',
      label: 'Data Commissioner Registration (ODPC)',
      checked: true,
      details: 'Registered data controller under Kenya Data Protection Act 2019.'
    }
  ]);

  const handleExecuteStrike = () => {
    const newRecord = runDailyStrike(strikeNote);
    setStrikeExecutedMessage(`Strike completed! New NAV: KSh ${newRecord.navPerUnit.toFixed(4)} published.`);
    setTimeout(() => setStrikeExecutedMessage(null), 4000);
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 uppercase">
              Admin & Operations Console
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Fund Manager Dashboard
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {config.status === 'circuit_breaker_paused' ? (
            <button
              onClick={resetCircuitBreaker}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
            >
              Reset Circuit Breaker
            </button>
          ) : (
            <button
              onClick={() => triggerCircuitBreakerSimulation(6.2)}
              className="px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs font-bold hover:bg-amber-100"
            >
              Simulate 6% Price Spike
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-200 dark:border-slate-800 text-xs font-semibold gap-6">
        <button
          onClick={() => setActiveTab('strike')}
          className={`pb-2.5 transition border-b-2 ${
            activeTab === 'strike'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          NAV Strike Operations
        </button>
        <button
          onClick={() => setActiveTab('controls')}
          className={`pb-2.5 transition border-b-2 ${
            activeTab === 'controls'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Fees & Fund Limits
        </button>
        <button
          onClick={() => setActiveTab('checklist')}
          className={`pb-2.5 transition border-b-2 ${
            activeTab === 'checklist'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Regulatory Readiness Checklist
        </button>
      </div>

      {/* TAB 1: STRIKE OPERATIONS */}
      {activeTab === 'strike' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-slate-500 block mb-1">Current NAV:</span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                KSh {currentNav.navPerUnit.toFixed(4)}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-slate-500 block mb-1">Silver TWAP (KES/g):</span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                KSh {currentNav.silverTwapKshPerGram.toFixed(2)}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-slate-500 block mb-1">Reserve Ratio:</span>
              <span className="text-xl font-bold font-mono text-emerald-600">
                {ratios.silverBackingCoveragePct.toFixed(1)}%
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-slate-500 block mb-1">Cap Status:</span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {ratios.capUtilizationPct}%
              </span>
            </div>
          </div>

          {/* Daily Strike Engine Runner */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Execute Daily NAV Strike (17:00 EAT)
                </h3>
                <p className="text-xs text-slate-500">
                  Calculates silver valuation + accrued cash yield - management fees, and records double-entry ledger entries
                </p>
              </div>
              <button
                onClick={handleExecuteStrike}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Run Strike Now</span>
              </button>
            </div>

            {strikeExecutedMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                {strikeExecutedMessage}
              </div>
            )}

            {/* Strike Input Breakdown */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <span className="font-bold text-slate-900 dark:text-white block uppercase tracking-wider text-[10px]">
                Auditable Strike Mathematical Inputs:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Physical Silver Fine:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {custodyHolding.currentFineGrams.toLocaleString()} g
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">15-min Silver TWAP:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    KSh {currentNav.silverTwapKshPerGram.toFixed(4)}/g
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Units Outstanding:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {currentNav.unitsOutstanding.toFixed(4)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Daily Cash Sleeve Income:</span>
                  <span className="font-bold text-emerald-600">
                    +KSh {currentNav.accruedIncomeKsh.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Daily 0.50% p.a. Fee Drag:</span>
                  <span className="font-bold text-rose-500">
                    -KSh {currentNav.accruedFeesKsh.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Grams Per Unit (Fixed):</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {config.gramsPerUnit.toFixed(8)} g
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONTROLS & LIMITS */}
      {activeTab === 'controls' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Fund Parameters & Risk Thresholds
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="font-bold text-slate-900 dark:text-white block">
                Fees & Spreads
              </span>
              <div>
                <label className="text-slate-500 block mb-1">Annual Management Fee (%)</label>
                <input
                  type="number"
                  step="0.05"
                  value={(config.annualMgmtFee * 100).toFixed(2)}
                  onChange={(e) =>
                    updateConfig({ annualMgmtFee: (parseFloat(e.target.value) || 0.5) / 100 })
                  }
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-slate-500 block mb-1">Dealing Spread (%)</label>
                <input
                  type="number"
                  step="0.05"
                  value={(config.dealingSpread * 100).toFixed(2)}
                  onChange={(e) =>
                    updateConfig({ dealingSpread: (parseFloat(e.target.value) || 0.5) / 100 })
                  }
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono font-bold"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="font-bold text-slate-900 dark:text-white block">
                Limits & Circuit Breaker
              </span>
              <div>
                <label className="text-slate-500 block mb-1">Circuit Breaker Trigger (% move)</label>
                <input
                  type="number"
                  step="0.5"
                  value={config.circuitBreakerThresholdPct}
                  onChange={(e) =>
                    updateConfig({ circuitBreakerThresholdPct: parseFloat(e.target.value) || 5.0 })
                  }
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-slate-500 block mb-1">Minimum Subscription (KSh)</label>
                <input
                  type="number"
                  step="0.01"
                  value={config.minSubscriptionAmount.KES}
                  onChange={(e) =>
                    updateConfig({
                      minSubscriptionAmount: {
                        ...config.minSubscriptionAmount,
                        KES: parseFloat(e.target.value) || 0.01
                      }
                    })
                  }
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REGULATORY READINESS CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            <strong>Honest Regulatory Disclosure:</strong> This application is a fully functional demonstration environment and simulation engine. It does not currently hold regulatory authorization from the Capital Markets Authority (CMA) or Central Bank of Kenya (CBK). Live production launch requires fulfilling the statutory checklist below.
          </div>

          <div className="space-y-3">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleChecklistItem(item.id)}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-xs"
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => {}}
                  className="mt-0.5 rounded text-slate-900 focus:ring-0"
                />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{item.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        item.checked
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {item.checked ? 'READY' : 'PENDING LEGAL/REGULATORY'}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-0.5">{item.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
