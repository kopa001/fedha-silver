import React from 'react';
import { useFund } from '../context/FundContext';
import { ShieldCheck, Vault, Landmark, FileText, CheckCircle2 } from 'lucide-react';

export const HoldingsDonut: React.FC = () => {
  const { custodyHolding, liquidityInstruments, ratios, currentNav } = useFund();

  const totalSleeveKsh = liquidityInstruments.reduce((sum, item) => sum + item.amountKsh, 0);
  const silverValKsh = custodyHolding.currentFineGrams * currentNav.silverTwapKshPerGram;
  const totalFundValKsh = silverValKsh + totalSleeveKsh;

  const actualSilverPct = totalFundValKsh > 0 ? (silverValKsh / totalFundValKsh) * 100 : 90;
  const actualCashPct = totalFundValKsh > 0 ? (totalSleeveKsh / totalFundValKsh) * 100 : 10;

  // SVG Donut params
  const size = 160;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const silverDash = (actualSilverPct / 100) * circumference;
  const cashDash = (actualCashPct / 100) * circumference;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Fund Asset Allocation</h3>
          <p className="text-xs text-slate-500">Fixed 200 kg physical silver + liquid cash sleeve</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>100% Backed</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Donut Chart */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <svg width={size} height={size} className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#E2E8F0"
                className="dark:stroke-slate-800"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Silver portion (90%) */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#2B3440"
                className="dark:stroke-slate-300"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${silverDash} ${circumference}`}
                strokeLinecap="round"
              />
              {/* Cash portion (10%) */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#10B981"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${cashDash} ${circumference}`}
                strokeDashoffset={-silverDash}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs text-slate-400 font-medium">Physical Silver</span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {actualSilverPct.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800 dark:bg-slate-300" />
              <span className="text-slate-600 dark:text-slate-400">Silver ({actualSilverPct.toFixed(0)}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-400">Cash Sleeve ({actualCashPct.toFixed(0)}%)</span>
            </div>
          </div>
        </div>

        {/* Physical Silver Reserve Card */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2 mb-2">
            <Vault className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <h4 className="font-semibold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Physical Silver Vault
            </h4>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Base Reserve:</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white">
                {custodyHolding.currentFineGrams.toLocaleString()} g (200 kg)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Purity:</span>
              <span className="text-slate-800 dark:text-slate-200">99.9% Fine Silver (LBMA)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Vault Location:</span>
              <span className="text-slate-800 dark:text-slate-200">Brinks Vault, Nairobi</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Insurance:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">100% Lloyds Underwritten</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Attestation:</span>
              <span className="text-slate-700 dark:text-slate-300 font-mono">
                {custodyHolding.lastAttestationDate} (Matched)
              </span>
            </div>
          </div>
        </div>

        {/* Liquidity Sleeve Card */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2 mb-2">
            <Landmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h4 className="font-semibold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Cash Liquidity Sleeve
            </h4>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Total Sleeve:</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white">
                KSh {(totalSleeveKsh / 1_000_000).toFixed(2)}M
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Indicative Yield:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                11.62% p.a. (CBK Auction)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Instruments:</span>
              <span className="text-slate-800 dark:text-slate-200">91d T-Bills & Call Deposit</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Avg. Maturity:</span>
              <span className="text-slate-800 dark:text-slate-200 font-mono">48 Days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Role:</span>
              <span className="text-slate-600 dark:text-slate-400">Instant redemptions & income</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
