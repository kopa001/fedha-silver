import React, { useState } from 'react';
import { useFund } from '../context/FundContext';
import { NavChart } from '../components/NavChart';
import { HoldingsDonut } from '../components/HoldingsDonut';
import { FactsheetModal } from '../components/FactsheetModal';
import {
  FileText,
  ShieldCheck,
  Scale,
  Landmark,
  Percent,
  Download,
  AlertTriangle,
  Info,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const FundView: React.FC = () => {
  const { config, currentNav, navHistory, custodyHolding, liquidityInstruments, ratios } = useFund();
  const [showFactsheet, setShowFactsheet] = useState<boolean>(false);
  const [tab, setTab] = useState<'overview' | 'holdings' | 'fees' | 'documents'>('overview');

  const totalSleeveKsh = liquidityInstruments.reduce((sum, item) => sum + item.amountKsh, 0);
  const totalSilverValueKsh = custodyHolding.currentFineGrams * currentNav.silverTwapKshPerGram;
  const totalFundValueKsh = totalSilverValueKsh + totalSleeveKsh;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Factsheet trigger */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Fund Transparency Centre
          </h2>
          <p className="text-xs text-slate-500">
            Real-time physical silver holdings, daily NAV strike records, and independent vault audits
          </p>
        </div>

        <button
          onClick={() => setShowFactsheet(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-xs hover:bg-slate-800 dark:hover:bg-slate-200 transition"
        >
          <FileText className="w-4 h-4" />
          <span>Download Factsheet (PDF)</span>
        </button>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex items-center border-b border-slate-200 dark:border-slate-800 text-xs font-semibold gap-6">
        <button
          onClick={() => setTab('overview')}
          className={`pb-2.5 transition border-b-2 ${
            tab === 'overview'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Overview & Performance
        </button>
        <button
          onClick={() => setTab('holdings')}
          className={`pb-2.5 transition border-b-2 ${
            tab === 'holdings'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Holdings & Reserves
        </button>
        <button
          onClick={() => setTab('fees')}
          className={`pb-2.5 transition border-b-2 ${
            tab === 'fees'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Fees & Pricing
        </button>
        <button
          onClick={() => setTab('documents')}
          className={`pb-2.5 transition border-b-2 ${
            tab === 'documents'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Legal & Audit Disclosures
        </button>
      </div>

      {/* TAB 1: OVERVIEW & PERFORMANCE */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Fund Metrics Matrix */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] text-slate-500 block mb-1">Total Fund Value</span>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                KSh {(totalFundValueKsh / 1_000_000).toFixed(2)}M
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Silver + Liquid Sleeve
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] text-slate-500 block mb-1">Units Outstanding</span>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {currentNav.unitsOutstanding.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Cap: {config.maxUnits.toLocaleString()} units
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] text-slate-500 block mb-1">Silver Backing Coverage</span>
              <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {ratios.silverBackingCoveragePct.toFixed(1)}%
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                Safe &gt; 100% threshold
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] text-slate-500 block mb-1">Cash Sleeve Yield</span>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                11.62% p.a.
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Indicative (Cash sleeve only)
              </span>
            </div>
          </div>

          {/* Interactive NAV Chart */}
          <NavChart navHistory={navHistory} />

          {/* Asset Allocation */}
          <HoldingsDonut />
        </div>
      )}

      {/* TAB 2: HOLDINGS & RESERVES */}
      {tab === 'holdings' && (
        <div className="space-y-6">
          <HoldingsDonut />

          {/* Detailed Vault Reserve Specifications */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">
              Physical Silver Vault Specifications & Custodian Controls
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                <div className="font-semibold text-slate-900 dark:text-white">
                  Vault Custodian Information
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Custodian Entity:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    Standard Custody & Trust Kenya Ltd
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Physical Facility:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    Brinks High Security Vault, Nairobi
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Starting Base Reserve:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    200,000 g (200 kg)
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Silver Content Per Unit:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    0.40000000 g (Fixed forever)
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                <div className="font-semibold text-slate-900 dark:text-white">
                  Insurance & Attestation Oversight
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Underwriting Policy:</span>
                  <span className="font-medium text-emerald-600">
                    Lloyds of London Syndicate #4421
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Coverage Scope:</span>
                  <span>100% replacement value (theft, damage, transit)</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Daily Attestation:</span>
                  <span className="font-mono text-emerald-600 font-semibold">
                    Automated Reconciliation Active
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Assay Standard:</span>
                  <span>LBMA Good Delivery Bar Standard (&gt; 99.9% pure)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cash Sleeve Schedule */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
              Cash Sleeve Liquidity Schedule
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Held in sovereign CBK Treasury Bills and instant call deposit facilities to ensure immediate same-day redemptions.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                    <th className="pb-2 font-medium">Instrument</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium text-right">Holding Value</th>
                    <th className="pb-2 font-medium text-right">Yield p.a.</th>
                    <th className="pb-2 font-medium text-right">Maturity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {liquidityInstruments.map((inst) => (
                    <tr key={inst.id} className="py-2">
                      <td className="py-2.5 font-medium text-slate-900 dark:text-white">
                        {inst.name}
                      </td>
                      <td className="py-2.5 text-slate-500 capitalize">
                        {inst.type.replace('_', ' ')}
                      </td>
                      <td className="py-2.5 text-right font-mono font-semibold text-slate-900 dark:text-white">
                        KSh {(inst.amountKsh / 1_000_000).toFixed(2)}M
                      </td>
                      <td className="py-2.5 text-right font-mono font-semibold text-emerald-600">
                        {inst.yieldAnnualPct}%
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-600 dark:text-slate-400">
                        {inst.maturityDays} days
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FEES & PRICING */}
      {tab === 'fees' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              Transparent Fee Schedule
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              FEDHA Silver MMF operates on complete transparency. No hidden charges or lock-in penalties.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="font-bold text-slate-900 dark:text-white text-sm block">
                  Management Fee
                </span>
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white my-2 block">
                  0.50% p.a.
                </span>
                <p className="text-slate-500 leading-relaxed">
                  Accrued daily into NAV (approx KSh 0.00068 per unit/day). Covers vault custody, LBMA assay audits, insurance, and platform administration.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="font-bold text-slate-900 dark:text-white text-sm block">
                  Dealing Spread (Instant)
                </span>
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white my-2 block">
                  0.50%
                </span>
                <p className="text-slate-500 leading-relaxed">
                  Applies only when choosing 60-second instant dealing. Zero (0.0%) spread on forward-priced daily 17:00 EAT strike orders.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="font-bold text-slate-900 dark:text-white text-sm block">
                  Tiny Purchase Waiver
                </span>
                <span className="text-2xl font-black font-mono text-emerald-600 my-2 block">
                  100% Free
                </span>
                <p className="text-slate-500 leading-relaxed">
                  All subscriptions under KSh 10.00 pay zero fee or spread (funded from manager fee pool) to support universal financial inclusion from KSh 0.01.
                </p>
              </div>
            </div>

            {/* Worked Examples */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">
                Worked Subscription Examples
              </h4>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between">
                  <div>
                    <strong className="block text-slate-900 dark:text-white">Amina: KSh 0.01 micro-subscription</strong>
                    <span className="text-slate-500">Forward priced @ KSh 53.84 · Fee: KSh 0.00 (Waiver active)</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-600">+0.00018573 units</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between">
                  <div>
                    <strong className="block text-slate-900 dark:text-white">Brian: KSh 5,000 instant subscription</strong>
                    <span className="text-slate-500">Instant quote with 0.50% spread (KSh 25.00 fee)</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">+92.86478912 units</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LEGAL & AUDIT DISCLOSURES */}
      {tab === 'documents' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Regulatory Disclosures & Statutory Documents
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              In accordance with Kenyan Collective Investment Scheme (CIS) best practices and the Capital Markets Authority regulatory guidelines, the following fund instruments and audit reports are maintained for public inspection.
            </p>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    FEDHA Silver MMF Information Memorandum & Rules
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Full fund charter, 200 kg fixed base reserve clause, and custody governance rules.
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-mono">v1.2 (Active)</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Independent Vault Attestation Certificate (October 2026)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Physical count and LBMA assay certificate of 200,000 g 99.9% fine silver ingots.
                  </div>
                </div>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Unqualified / Clean</span>
                </span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Cryptographic Ledger Hash Chain Audit Report
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Double-entry SHA-256 integrity verification across all investor balances.
                  </div>
                </div>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified 100%</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Factsheet Modal */}
      <FactsheetModal isOpen={showFactsheet} onClose={() => setShowFactsheet(false)} />
    </div>
  );
};
