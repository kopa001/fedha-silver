import React, { useState } from 'react';
import { useFund } from '../context/FundContext';
import { FundOps } from '../fund-ops/FundOps';
import { X, Calculator, AlertTriangle, TrendingDown, TrendingUp, Info } from 'lucide-react';

interface WhatIfModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatIfModal: React.FC<WhatIfModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, currentNav } = useFund();
  const [shockPct, setShockPct] = useState<number>(-10); // default -10% scenario

  if (!isOpen) return null;

  const currentPositionKes = currentUser.unitBalance * currentNav.navPerUnit;
  const result = FundOps.calculateWhatIfScenario({
    currentPositionKes,
    unitsHeld: currentUser.unitBalance,
    currentNav: currentNav.navPerUnit,
    silverShockPct: shockPct
  });

  const isPositive = result.valueDifferenceKes >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                What-If Sensitivity Calculator
              </h3>
              <p className="text-xs text-slate-500">Simulate silver commodity price moves</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Current position */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block">Your Current Holding:</span>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                KSh {currentPositionKes.toFixed(2)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Units Held:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {currentUser.unitBalance.toFixed(8)} units
              </span>
            </div>
          </div>

          {/* Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-500 font-medium">Hypothetical Silver Move:</span>
              <span
                className={`font-mono font-bold text-sm ${
                  shockPct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {shockPct > 0 ? '+' : ''}
                {shockPct}%
              </span>
            </div>
            <input
              type="range"
              min="-40"
              max="40"
              step="1"
              value={shockPct}
              onChange={(e) => setShockPct(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-900 dark:accent-slate-200"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>-40% Crash</span>
              <span>-10%</span>
              <span>0% Baseline</span>
              <span>+10%</span>
              <span>+40% Surge</span>
            </div>
          </div>

          {/* Result card */}
          <div
            className={`p-4 rounded-xl border ${
              isPositive
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
            } space-y-2 text-xs`}
          >
            <div className="flex items-center gap-2 mb-1">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-600" />
              )}
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Projected Outcome
              </h4>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Projected NAV per unit:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                KSh {result.projectedNav.toFixed(4)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Projected Position Value:</span>
              <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                KSh {result.projectedValueKes.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">Value Change:</span>
              <span
                className={`font-mono font-bold ${
                  isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {result.valueDifferenceKes > 0 ? '+' : ''}KSh {result.valueDifferenceKes.toFixed(2)} ({result.pctChangePosition}%)
              </span>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500">
            <Info className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
            <div>
              <strong>Sensitivity Note:</strong> Calculation assumes a 90% silver asset weighting buffered by 10% cash sleeve yield. For illustrative purposes only. Past performance does not guarantee future results.
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
};
