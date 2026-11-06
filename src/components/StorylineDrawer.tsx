import React from 'react';
import { useFund } from '../context/FundContext';
import { Play, CheckCircle2, AlertTriangle, ShieldCheck, Zap, Scale, Clock, RefreshCw, X } from 'lucide-react';

interface StorylineDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: 'home' | 'fund' | 'invest' | 'portfolio' | 'more' | 'admin' | 'custodian' | 'compliance' | 'auditor') => void;
}

export const StorylineDrawer: React.FC<StorylineDrawerProps> = ({ isOpen, onClose, onNavigateToTab }) => {
  const {
    runStoryline,
    config,
    currentUser,
    switchUser,
    resolveCustodyMismatch,
    resetCircuitBreaker,
    resetCapReachedSimulation
  } = useFund();

  if (!isOpen) return null;

  const storylines = [
    {
      id: 1,
      title: '1. Amina Micro-Subscription (KSh 0.01)',
      desc: 'Invest as little as KSh 0.01. Demonstrates 8-decimal units, 100% fee waiver for micro-savings, and forward pricing.',
      icon: Zap,
      action: () => {
        runStoryline(1);
        onNavigateToTab('invest');
        onClose();
      }
    },
    {
      id: 2,
      title: '2. Brian Instant Dealing (KSh 5,000)',
      desc: 'Demonstrates instant subscription with dealing spread, 60-second price lock timer, and PIN confirmation.',
      icon: Play,
      action: () => {
        runStoryline(2);
        onNavigateToTab('invest');
        onClose();
      }
    },
    {
      id: 3,
      title: '3. Daily 17:00 EAT NAV Strike',
      desc: 'Executes the mathematical strike formula: silver TWAP + cash sleeve + income accrual - 0.50% fee drag.',
      icon: RefreshCw,
      action: () => {
        runStoryline(3);
        onNavigateToTab('fund');
        onClose();
      }
    },
    {
      id: 4,
      title: '4. Cash Redemption & Settlement Gates',
      desc: 'Shows same-day instant liquidity payout vs T+1 honest settlement delay when exceeding daily limits.',
      icon: Clock,
      action: () => {
        runStoryline(4);
        onNavigateToTab('invest');
        onClose();
      }
    },
    {
      id: 5,
      title: '5. Physical Silver Bar Redemption (10 g)',
      desc: 'Redeem physical LBMA silver against 6-digit OTP code & QR, verified and released by Custodian Operator.',
      icon: Scale,
      action: () => {
        runStoryline(5);
        onNavigateToTab('custodian');
        onClose();
      }
    },
    {
      id: 6,
      title: '6. Vault Attestation Mismatch Auto-Pause',
      desc: 'Simulates a 5,000g vault discrepancy: automatically pauses subscriptions & physical redemptions with alerts.',
      icon: AlertTriangle,
      action: () => {
        runStoryline(6);
        onNavigateToTab('admin');
        onClose();
      }
    },
    {
      id: 7,
      title: '7. Market Circuit Breaker (> 5% Volatility)',
      desc: 'Simulates a 6.2% silver price spike: pauses instant dealing spread orders while forward pricing continues.',
      icon: Zap,
      action: () => {
        runStoryline(7);
        onNavigateToTab('invest');
        onClose();
      }
    },
    {
      id: 8,
      title: '8. Fund At Capacity (200 kg Cap Reached)',
      desc: 'Fund reaches its maximum 490,000 units. Subscriptions lock and waitlist banner appears.',
      icon: ShieldCheck,
      action: () => {
        runStoryline(8);
        onNavigateToTab('fund');
        onClose();
      }
    },
    {
      id: 9,
      title: '9. Social Recovery (Lost Phone / PIN)',
      desc: 'Lost device recovery protocol: 3 trusted contacts, 2 approvals required, with a secure 72-hour delay.',
      icon: CheckCircle2,
      action: () => {
        runStoryline(9);
        onNavigateToTab('portfolio');
        onClose();
      }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-amber-600 dark:text-amber-400">
                Interactive Evaluator Guide
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">5-Minute Guided Storylines</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select any scenario to configure state and jump straight to the relevant screen.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status recovery reset bar if tests triggered */}
        {(config.status !== 'active' || currentUser.recoveryRequested) && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
            <span>
              <strong>Active Simulation:</strong> {config.statusReason || config.status}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              {config.status === 'paused_custody_mismatch' && (
                <button
                  onClick={resolveCustodyMismatch}
                  className="px-2.5 py-1 rounded bg-amber-600 text-white font-medium hover:bg-amber-700"
                >
                  Resolve Mismatch
                </button>
              )}
              {config.status === 'circuit_breaker_paused' && (
                <button
                  onClick={resetCircuitBreaker}
                  className="px-2.5 py-1 rounded bg-amber-600 text-white font-medium hover:bg-amber-700"
                >
                  Reset Circuit Breaker
                </button>
              )}
              {config.status === 'capacity_reached' && (
                <button
                  onClick={resetCapReachedSimulation}
                  className="px-2.5 py-1 rounded bg-amber-600 text-white font-medium hover:bg-amber-700"
                >
                  Reset Cap
                </button>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {storylines.map((story) => {
            const Icon = story.icon;
            return (
              <div
                key={story.id}
                onClick={story.action}
                className="group flex flex-col justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-slate-400 hover:shadow-md cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/30"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                      {story.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {story.desc}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span>Click to launch</span>
                  <span className="text-slate-900 dark:text-white font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                    Run Story &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Active user: <strong>{currentUser.name}</strong> ({currentUser.role.replace('_', ' ')})</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
