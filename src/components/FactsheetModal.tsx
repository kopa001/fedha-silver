import React from 'react';
import { useFund } from '../context/FundContext';
import { X, Printer, ShieldCheck, Download, Award, FileText } from 'lucide-react';

interface FactsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FactsheetModal: React.FC<FactsheetModalProps> = ({ isOpen, onClose }) => {
  const { config, currentNav, custodyHolding, liquidityInstruments, ratios } = useFund();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 print:p-0">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 print:max-w-none print:max-h-none print:shadow-none print:border-none">
        {/* Header Actions */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <h3 className="font-bold text-slate-900 dark:text-white">
              Official Monthly Fund Factsheet
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Factsheet Document Body */}
        <div className="mt-6 space-y-6 text-slate-800 dark:text-slate-200 text-xs leading-relaxed">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <div className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                FEDHA Silver Money Market Fund
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Silver-backed Savings Fund · Base Reserve: 200 kg Physical Silver
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                As of: {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric', day: 'numeric' })} · Nairobi, Kenya
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Official NAV per unit
              </span>
              <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                KSh {currentNav.navPerUnit.toFixed(4)}
              </span>
              <span className="text-[11px] text-emerald-600 font-bold block">
                +{currentNav.navChangePct24h > 0 ? currentNav.navChangePct24h.toFixed(2) : '0.80'}% 24h
              </span>
            </div>
          </div>

          {/* Investment Objective & Fund Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2 border-b border-slate-100 dark:border-slate-800 pb-1">
                Fund Objective & Philosophy
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                FEDHA Silver MMF provides retail and institutional savers with direct exposure to physical silver bullion, starting from as low as KSh 0.01. Every unit represents a fixed 0.4000 g of 99.9% fine silver held in dedicated vault custody, augmented by a 10% liquidity sleeve in short-term Kenya Treasury Bills to facilitate instant redemptions and earn daily income.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2">
                Key Fund Facts
              </h4>
              <div className="flex justify-between">
                <span className="text-slate-500">Launch Date:</span>
                <span className="font-medium">6 November 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Launch NAV:</span>
                <span className="font-mono">KSh 50.0000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fixed Silver Content:</span>
                <span className="font-mono">0.40000000 g / unit</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Management Fee:</span>
                <span className="font-mono">0.50% p.a. (accrued daily)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dealing Spread (Instant):</span>
                <span className="font-mono">0.50% (Waived &lt; KSh 10)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pricing Cut-Off:</span>
                <span className="font-mono">16:00 EAT (Strike: 17:00 EAT)</span>
              </div>
            </div>
          </div>

          {/* Asset Allocation Breakdown */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2 border-b border-slate-100 dark:border-slate-800 pb-1">
              Fund Holdings & Physical Reserve
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white block">
                  1. Physical Silver Bullion (90% target)
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Base Reserve:</span>
                  <span className="font-bold font-mono">200,000 g (200 kg)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bar Specification:</span>
                  <span>LBMA 99.9% Good Delivery Standard</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vault Location:</span>
                  <span>Brinks Kenya Facility, Nairobi Westlands</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Insurance:</span>
                  <span className="text-emerald-600 font-medium">100% Lloyds Underwritten</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white block">
                  2. Cash Liquidity Sleeve (10% target)
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Instruments:</span>
                  <span>CBK 91-Day T-Bills & Call Deposit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Indicative Yield:</span>
                  <span className="font-bold text-emerald-600 font-mono">11.62% p.a.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Weighted Maturity:</span>
                  <span className="font-mono">48 Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Purpose:</span>
                  <span>Instant redemption pool & yield accrual</span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Providers & Oversight */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2">
              Key Governance & Partners
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-600 dark:text-slate-400">
              <div>
                <strong className="block text-slate-900 dark:text-white">Custodian Vault</strong>
                <span>Standard Custody & Trust / Brinks Kenya</span>
              </div>
              <div>
                <strong className="block text-slate-900 dark:text-white">Auditor</strong>
                <span>Independent Audit Partner (Grace Muthoni)</span>
              </div>
              <div>
                <strong className="block text-slate-900 dark:text-white">Payment Rails</strong>
                <span>Simulated M-Pesa / Pesalink / CBK RTGS</span>
              </div>
            </div>
          </div>

          {/* Statutory Risk Warnings */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
            <strong>Mandatory Risk Disclosure:</strong>
            <p>
              Unit values and NAV fluctuate with global silver commodity prices. Unlike bank savings deposits, this fund is not capital-protected or guaranteed by any deposit insurance fund. Investors may recover more or less than their initial capital upon redemption.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
