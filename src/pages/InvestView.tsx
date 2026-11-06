import React, { useState } from 'react';
import { useFund } from '../context/FundContext';
import { SubscribeModal } from '../components/SubscribeModal';
import { RedeemModal } from '../components/RedeemModal';
import { ArrowDownRight, ArrowUpRight, Scale, Clock, Zap, Info, ShieldCheck } from 'lucide-react';

export const InvestView: React.FC = () => {
  const { currentUser, currentNav, config, ratios } = useFund();
  const [activeModal, setActiveModal] = useState<'subscribe' | 'redeem' | null>(null);

  const positionValueKes = currentUser.unitBalance * currentNav.navPerUnit;

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Invest & Redeem
        </h2>
        <p className="text-xs text-slate-500">
          Subscribe to FEDHA units from as little as KSh 0.01 or redeem back to cash anytime
        </p>
      </div>

      {/* Capacity Notice if applicable */}
      {ratios.isCapReached && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <ShieldCheck className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <strong>Fund at Full Capacity (200 kg Silver Limit):</strong>
            <p className="mt-0.5">
              All 490,000 units backed by the base reserve are currently issued. New subscriptions will be queued onto the official waitlist until existing units are redeemed.
            </p>
          </div>
        </div>
      )}

      {/* Main Choice Cards: Subscribe vs Redeem */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Subscribe Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <ArrowDownRight className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Subscribe (Buy Units)
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Invest starting from <strong>KSh 0.01</strong>. Choose Forward Pricing (17:00 strike, zero spread) or Instant Subscribe (60s lock).
            </p>

            <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Your Wallet Balance:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  KSh {currentUser.walletBalanceKes.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current NAV:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  KSh {currentNav.navPerUnit.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Micro-fee waiver:</span>
                <span className="text-emerald-600 font-semibold font-mono">
                  100% Free &lt; KSh 10
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveModal('subscribe')}
            className="mt-6 w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-200 transition shadow-xs"
          >
            Open Subscription Panel
          </button>
        </div>

        {/* Redeem Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center mb-3">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Redeem (Cash or Physical)
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Redeem to KSh wallet instantly from the liquidity sleeve, or request physical 99.9% silver bars for pickup at Brinks Nairobi.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Units Available:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {currentUser.unitBalance.toFixed(8)} units
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Position Value:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  ~KSh {positionValueKes.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Physical Pickup Min:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  5 grams (Assayed bar)
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveModal('redeem')}
            disabled={currentUser.unitBalance <= 0}
            className="mt-6 w-full py-3 rounded-xl bg-slate-800 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentUser.unitBalance > 0 ? 'Open Redemption Panel' : 'No Units Held to Redeem'}
          </button>
        </div>
      </div>

      {/* Honest Risk Notice */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
        <Info className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-slate-900 dark:text-white">Statutory Dealing Notice:</strong>
          <p className="leading-relaxed">
            All orders are transacted directly with the fund at official or indicative NAV per unit. There is no secondary market or order book. Forward-priced orders received prior to 16:00 EAT are settled at that day's 17:00 strike. Instant dealing requests lock pricing for 60 seconds.
          </p>
        </div>
      </div>

      {/* Modals */}
      <SubscribeModal
        isOpen={activeModal === 'subscribe'}
        onClose={() => setActiveModal(null)}
      />
      <RedeemModal
        isOpen={activeModal === 'redeem'}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
};
