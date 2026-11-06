import React, { useState, useEffect } from 'react';
import { useFund } from '../context/FundContext';
import { TRANSLATIONS } from '../i18n/translations';
import { SilverPerformanceChart } from '../components/SilverPerformanceChart';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Send,
  Download,
  ShieldCheck,
  Coins,
  ChevronRight,
  Sparkles,
  Info,
  Layers,
  Activity
} from 'lucide-react';

interface HomeViewProps {
  onOpenSubscribe: () => void;
  onOpenRedeem: () => void;
  onOpenSendReceive: (tab?: 'send' | 'receive') => void;
  onNavigateToTab: (tab: 'fund' | 'invest' | 'portfolio' | 'more') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenSubscribe,
  onOpenRedeem,
  onOpenSendReceive,
  onNavigateToTab
}) => {
  const {
    currentUser,
    currentNav,
    navHistory,
    config,
    ratios,
    orders,
    notices,
    language,
    displayCurrencyFirst
  } = useFund();

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isNavPositive = currentNav.navChange24h >= 0;

  // Countdown timer to 17:00 EAT strike
  const [countdown, setCountdown] = useState<string>('00:00:00');
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // 17:00 EAT = 14:00 UTC
      const nextStrike = new Date();
      nextStrike.setUTCHours(14, 0, 0, 0);
      if (now.getTime() > nextStrike.getTime()) {
        nextStrike.setUTCDate(nextStrike.getUTCDate() + 1);
      }
      const diffMs = nextStrike.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
      setCountdown(
        `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      );
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Portfolio calculations
  const positionValueKes = currentUser.unitBalance * currentNav.navPerUnit;
  const initialInvestedKes = currentUser.initialInvestedKes || 0;
  const totalReturnKes = positionValueKes - initialInvestedKes;
  const totalReturnPct = initialInvestedKes > 0 ? (totalReturnKes / initialInvestedKes) * 100 : 0;

  // User's recent orders (max 5)
  const userRecentOrders = orders.filter((o) => o.userId === currentUser.id).slice(0, 5);

  return (
    <div className="space-y-5 pb-12">
      {/* 1. Daily Official NAV Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.nav_today}
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs text-slate-400">1 unit = 0.4000 g Ag</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-mono">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Next Strike: {countdown}</span>
          </div>
        </div>

        <div className="mt-2 flex items-baseline justify-between flex-wrap gap-2">
          <div>
            <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
              KSh {currentNav.navPerUnit.toFixed(4)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs font-bold flex items-center ${
                  isNavPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isNavPositive ? (
                  <TrendingUp className="w-3.5 h-3.5 inline mr-1" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 inline mr-1" />
                )}
                {isNavPositive ? '+' : ''}
                {currentNav.navChange24h.toFixed(4)} ({currentNav.navChangePct24h > 0 ? '+' : ''}
                {currentNav.navChangePct24h.toFixed(2)}% 24h)
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs text-slate-400">Daily strike 17:00 EAT</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('fund')}
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 group"
          >
            <span>View NAV History</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
          </button>
        </div>
      </div>

      {/* 2. Investor Portfolio Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="font-semibold uppercase tracking-wider text-slate-400">
            {t.portfolio_value}
          </span>
          <span className="text-xs bg-slate-800/80 px-2 py-0.5 rounded text-slate-300 font-mono">
            {currentUser.name}
          </span>
        </div>

        <div className="mt-2">
          {displayCurrencyFirst ? (
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white">
                KSh {positionValueKes.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-slate-300 font-mono mt-1">
                {currentUser.unitBalance.toFixed(8)} FEDHA units
              </div>
            </div>
          ) : (
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white">
                {currentUser.unitBalance.toFixed(8)} units
              </div>
              <div className="text-xs text-slate-300 font-mono mt-1">
                KSh {positionValueKes.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          )}

          {/* Return breakdown stats */}
          {initialInvestedKes > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
              <span>{t.return_since_start}:</span>
              <span
                className={`font-mono font-bold ${
                  totalReturnKes >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {totalReturnKes >= 0 ? '+' : ''}KSh {totalReturnKes.toFixed(2)} ({totalReturnPct >= 0 ? '+' : ''}
                {totalReturnPct.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-5 grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={onOpenSubscribe}
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition shadow-xs"
          >
            <ArrowDownRight className="w-4 h-4 mb-1 text-emerald-600" />
            <span>Subscribe</span>
          </button>

          <button
            onClick={onOpenRedeem}
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            <ArrowUpRight className="w-4 h-4 mb-1 text-slate-300" />
            <span>Redeem</span>
          </button>

          <button
            onClick={() => onOpenSendReceive('send')}
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            <Send className="w-4 h-4 mb-1 text-slate-300" />
            <span>Send</span>
          </button>

          <button
            onClick={() => onOpenSendReceive('receive')}
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            <Download className="w-4 h-4 mb-1 text-slate-300" />
            <span>Receive</span>
          </button>
        </div>
      </div>

      {/* 3. Recharts 30-Day Silver Price Performance Trend */}
      <SilverPerformanceChart navHistory={navHistory} />

      {/* 4. "Today in Silver" Plain Language Market Update */}
      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-start gap-3 text-xs">
        <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 shrink-0">
          <Sparkles className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-0.5">
            Today in Silver: LBMA Market Pulse
          </h4>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Spot silver trades at <strong>$32.85/oz</strong> (KSh 134.82/g in Nairobi). Fund backing remains 100% physically covered by the 200 kg Brinks vault reserve. The 10% liquidity sleeve continues accruing 11.62% p.a. from CBK treasury bills daily.
          </p>
        </div>
      </div>

      {/* 4. Fund Health Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-slate-500 block mb-1">Silver Backing:</span>
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white font-mono text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{ratios.silverBackingCoveragePct.toFixed(1)}%</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">200 kg Vault Match</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-slate-500 block mb-1">Capacity Remaining:</span>
          <div className="font-bold text-slate-900 dark:text-white font-mono text-sm">
            {ratios.unitsRemainingBeforeCap.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {ratios.capUtilizationPct}% issued of 490k
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-slate-500 block mb-1">Liquidity Coverage:</span>
          <div className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
            {ratios.liquidityCoveragePct.toFixed(0)}%
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Instant redemptions safe</span>
        </div>
      </div>

      {/* 5. Recent Activity */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Activity</h3>
          </div>
          <button
            onClick={() => onNavigateToTab('portfolio')}
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            View All
          </button>
        </div>

        {userRecentOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            <p>No transactions yet.</p>
            <button
              onClick={onOpenSubscribe}
              className="mt-2 text-slate-900 dark:text-white font-bold underline"
            >
              Start your first subscription with KSh 0.01 &rarr;
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {userRecentOrders.map((order) => {
              const isSub = order.type === 'subscribe';
              return (
                <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isSub
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {isSub ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white capitalize">
                        {order.type} ({order.pricingMode})
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {order.createdAt.split('T')[0]} · NAV KSh {order.navApplied.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-mono font-bold ${
                        isSub ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {isSub ? '+' : '-'}
                      {order.units.toFixed(6)} units
                    </div>
                    <div className="text-[11px] text-slate-500">
                      KSh {order.amountFiat.toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
