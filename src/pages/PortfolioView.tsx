import React, { useState } from 'react';
import { useFund } from '../context/FundContext';
import { WhatIfModal } from '../components/WhatIfModal';
import { SendReceiveModal } from '../components/SendReceiveModal';
import {
  Wallet,
  Coins,
  ArrowDownRight,
  ArrowUpRight,
  Send,
  Download,
  FileText,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  UserCheck
} from 'lucide-react';

export const PortfolioView: React.FC = () => {
  const {
    currentUser,
    currentNav,
    depositFiatWallet,
    withdrawFiatWallet,
    updateCurrentUser,
    orders,
    physicalRedemptions
  } = useFund();

  const [showWhatIf, setShowWhatIf] = useState<boolean>(false);
  const [showSendReceive, setShowSendReceive] = useState<boolean>(false);
  const [sendReceiveTab, setSendReceiveTab] = useState<'send' | 'receive'>('send');
  const [depositAmount, setDepositAmount] = useState<string>('1000');
  const [showDepositModal, setShowDepositModal] = useState<boolean>(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('500');
  const [activeTab, setActiveTab] = useState<'overview' | 'statements' | 'recovery'>('overview');

  const positionValueKes = currentUser.unitBalance * currentNav.navPerUnit;
  const initialInvested = currentUser.initialInvestedKes || 0;
  const totalReturnKes = positionValueKes - initialInvested;
  const totalReturnPct = initialInvested > 0 ? (totalReturnKes / initialInvested) * 100 : 0;

  // Accrued income share (sleeve yield component ~11.6% on 10%)
  const accruedIncomeEstimatedKes = positionValueKes * 0.10 * 0.116 * 0.5; // estimated 6-month demo accrual

  const userOrders = orders.filter((o) => o.userId === currentUser.id);

  // Statements list
  const demoStatements = [
    {
      month: 'October 2026',
      period: '01 Oct 2026 - 31 Oct 2026',
      units: currentUser.unitBalance.toFixed(4),
      nav: '53.8400',
      incomeEarned: 'KSh 142.50',
      status: 'Available'
    },
    {
      month: 'September 2026',
      period: '01 Sep 2026 - 30 Sep 2026',
      units: (currentUser.unitBalance * 0.95).toFixed(4),
      nav: '52.9100',
      incomeEarned: 'KSh 138.20',
      status: 'Available'
    },
    {
      month: 'August 2026',
      period: '01 Aug 2026 - 31 Aug 2026',
      units: (currentUser.unitBalance * 0.88).toFixed(4),
      nav: '51.4500',
      incomeEarned: 'KSh 122.00',
      status: 'Available'
    }
  ];

  const handleDepositSubmit = () => {
    const val = parseFloat(depositAmount) || 0;
    if (val > 0) {
      depositFiatWallet(val);
      setShowDepositModal(false);
    }
  };

  const handleWithdrawSubmit = () => {
    const val = parseFloat(withdrawAmount) || 0;
    if (val > 0) {
      withdrawFiatWallet(val);
      setShowWithdrawModal(false);
    }
  };

  const handleExportStatementCSV = (month: string) => {
    const csvContent =
      'data:text/csv;charset=utf-8,Month,Period,Units,NAV,Accrued_Income\n' +
      `${month},Monthly_Statement,${currentUser.unitBalance.toFixed(8)},${currentNav.navPerUnit.toFixed(4)},${accruedIncomeEstimatedKes.toFixed(2)}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FEDHA_Statement_${month.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Portfolio & Balances
          </h2>
          <p className="text-xs text-slate-500">
            Manage your KSh cash wallet, FEDHA silver units, statements, and recovery contacts
          </p>
        </div>

        <button
          onClick={() => setShowWhatIf(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50"
        >
          <Calculator className="w-4 h-4 text-amber-500" />
          <span>What-If Tool</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-200 dark:border-slate-800 text-xs font-semibold gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2.5 transition border-b-2 ${
            activeTab === 'overview'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Balances & Wallets
        </button>
        <button
          onClick={() => setActiveTab('statements')}
          className={`pb-2.5 transition border-b-2 ${
            activeTab === 'statements'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Monthly Statements
        </button>
        <button
          onClick={() => setActiveTab('recovery')}
          className={`pb-2.5 transition border-b-2 ${
            activeTab === 'recovery'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Social Recovery
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Dual Balance Cards: KSh Wallet vs FEDHA Units */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* KSh Cash Wallet */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span className="font-semibold uppercase tracking-wider">
                      Cash Wallet Balance
                    </span>
                  </div>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">
                    Instant rail (M-Pesa)
                  </span>
                </div>

                <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                  KSh {currentUser.walletBalanceKes.toFixed(2)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Available for subscriptions or immediate withdrawal to your phone
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setShowDepositModal(true)}
                  className="py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-200 transition"
                >
                  Deposit KSh
                </button>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  disabled={currentUser.walletBalanceKes <= 0}
                  className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
                >
                  Withdraw
                </button>
              </div>
            </div>

            {/* FEDHA Units Balance */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-slate-300" />
                    <span className="font-semibold uppercase tracking-wider text-slate-400">
                      Silver Units Held
                    </span>
                  </div>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">
                    NAV: KSh {currentNav.navPerUnit.toFixed(4)}
                  </span>
                </div>

                <div className="text-3xl font-extrabold font-mono text-white">
                  {currentUser.unitBalance.toFixed(8)}
                </div>
                <div className="text-xs text-slate-300 mt-1 font-mono">
                  Current Market Value: <strong>KSh {positionValueKes.toFixed(2)}</strong>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    setSendReceiveTab('send');
                    setShowSendReceive(true);
                  }}
                  className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
                >
                  Send Units
                </button>
                <button
                  onClick={() => {
                    setSendReceiveTab('receive');
                    setShowSendReceive(true);
                  }}
                  className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
                >
                  Receive Units
                </button>
              </div>
            </div>
          </div>

          {/* Income Accrual Card & Reinvestment Preference */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Cash Sleeve Income Accumulation
                </h3>
                <p className="text-xs text-slate-500">
                  Daily yield from the 10% CBK Treasury Bill liquidity sleeve
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Accrued to Date:</span>
                <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                  +KSh {accruedIncomeEstimatedKes.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Yield Application Mode
                </span>
                <span className="text-slate-500 text-[11px]">
                  {currentUser.incomePreference === 'accumulate'
                    ? 'Currently accumulating directly into your daily NAV value (compounding)'
                    : 'Monthly distribution paid as newly minted FEDHA units'}
                </span>
              </div>

              <button
                onClick={() =>
                  updateCurrentUser({
                    incomePreference:
                      currentUser.incomePreference === 'accumulate' ? 'distribute_units' : 'accumulate'
                  })
                }
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-white dark:hover:bg-slate-700 transition"
              >
                Switch to {currentUser.incomePreference === 'accumulate' ? 'Monthly Units' : 'Accumulating NAV'}
              </button>
            </div>
          </div>

          {/* Transaction Ledger Records */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
              Your Complete Transaction History
            </h3>

            {userOrders.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No transactions recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {userOrders.map((order) => (
                  <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white capitalize">
                        {order.type} ({order.pricingMode})
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {order.createdAt.split('T')[0]} · {order.id} · NAV KSh {order.navApplied.toFixed(4)}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {order.settlementEstimate}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-mono font-bold ${
                          order.type === 'subscribe'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {order.type === 'subscribe' ? '+' : '-'}
                        {order.units.toFixed(6)} units
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        KSh {order.amountFiat.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: STATEMENTS */}
      {activeTab === 'statements' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Monthly Account Statements
              </h3>
              <p className="text-xs text-slate-500">
                Download verified tax-style reports of unit subscriptions, redemptions, and NAV movements
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {demoStatements.map((stmt) => (
              <div key={stmt.month} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {stmt.month}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    {stmt.period} · Closing NAV: KSh {stmt.nav}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="font-mono text-slate-900 dark:text-white block font-semibold">
                      {stmt.units} units
                    </span>
                    <span className="text-[11px] text-emerald-600">{stmt.incomeEarned} yield</span>
                  </div>

                  <button
                    onClick={() => handleExportStatementCSV(stmt.month)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 text-xs"
                    title="Download CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SOCIAL RECOVERY */}
      {activeTab === 'recovery' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Social Recovery Protocol
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              If you lose your phone or forget your PIN, you can recover access without relying on centralized SMS reset. Any 2 of your 3 trusted contacts must approve the recovery, followed by a mandatory 72-hour security delay.
            </p>
          </div>

          {currentUser.recoveryRequested ? (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 space-y-2 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                <span>Recovery Delay In Progress (72-Hour Security Window)</span>
              </div>
              <p>
                Two trusted contacts (<strong>{currentUser.recoveryRequested.approvals.join(' and ')}</strong>) have approved access recovery.
              </p>
              <div className="font-mono text-amber-700 dark:text-amber-300">
                Estimated time remaining: <strong>{currentUser.recoveryRequested.etaHoursRemaining} hours</strong>
              </div>
              <p className="text-[11px] text-slate-500">
                Alert notifications have been sent to your registered email and push channels. If you did not initiate this, freeze your account immediately.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Your 3 Trusted Contacts:
              </div>
              {currentUser.socialRecoveryContacts.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500">
                  No recovery contacts assigned. Default contacts can be configured.
                </div>
              ) : (
                currentUser.socialRecoveryContacts.map((contact, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="block text-slate-900 dark:text-white">{contact.name}</strong>
                      <span className="text-slate-400 font-mono">{contact.phone}</span>
                    </div>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirmed</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              Top Up KSh Wallet
            </h4>
            <p className="text-xs text-slate-500">
              Simulated M-Pesa instant deposit rail.
            </p>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Amount (KSh)</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDepositModal(false)}
                className="w-1/2 py-2 rounded-xl border text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDepositSubmit}
                className="w-1/2 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold"
              >
                Deposit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              Withdraw to M-Pesa
            </h4>
            <p className="text-xs text-slate-500">
              Payout directly to your registered phone number ({currentUser.phone}).
            </p>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Amount (KSh)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="w-1/2 py-2 rounded-xl border text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawSubmit}
                className="w-1/2 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <WhatIfModal isOpen={showWhatIf} onClose={() => setShowWhatIf(false)} />
      <SendReceiveModal
        isOpen={showSendReceive}
        onClose={() => setShowSendReceive(false)}
        defaultTab={sendReceiveTab}
      />
    </div>
  );
};
