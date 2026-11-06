import React, { useState } from 'react';
import { useFund } from '../context/FundContext';
import { X, Send, Download, QrCode, CheckCircle2, Copy, AlertCircle } from 'lucide-react';

interface SendReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'send' | 'receive';
}

export const SendReceiveModal: React.FC<SendReceiveModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'send'
}) => {
  const { currentUser, currentNav, allUsers, sendUnitsToUser } = useFund();
  const [tab, setTab] = useState<'send' | 'receive'>(defaultTab);

  // Send state
  const [recipient, setRecipient] = useState<string>('');
  const [unitsStr, setUnitsStr] = useState<string>('1.0');
  const [note, setNote] = useState<string>('Gift');
  const [isSent, setIsSent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const unitsNum = parseFloat(unitsStr) || 0;
  const estimatedKes = unitsNum * currentNav.navPerUnit;

  const handleSend = () => {
    setError(null);
    if (!recipient.trim()) {
      setError('Please enter a recipient phone number or email.');
      return;
    }
    if (unitsNum <= 0) {
      setError('Units must be greater than zero.');
      return;
    }
    if (unitsNum > currentUser.unitBalance) {
      setError(`Insufficient units. You hold ${currentUser.unitBalance.toFixed(8)} units.`);
      return;
    }

    const result = sendUnitsToUser(recipient.trim(), unitsNum, note);
    if (result.success) {
      setIsSent(true);
    } else {
      setError(result.error || 'Failed to send units');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetAndClose = () => {
    setIsSent(false);
    setError(null);
    onClose();
  };

  // Other users list for quick click
  const otherInvestors = allUsers.filter(
    (u) => u.role === 'investor' && u.id !== currentUser.id
  ).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs p-3 sm:p-4 flex min-h-full items-start sm:items-center justify-center">
      <div className="w-full max-w-md max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-auto overflow-hidden">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs px-5 sm:px-6 pt-5 pb-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Transfer Units
            </h3>
          </div>
          <button
            onClick={resetAndClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-5 sm:p-6 pt-4 overflow-y-auto flex-1 space-y-4 overscroll-contain">
          {/* Tab switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1 text-xs font-semibold">
          <button
            onClick={() => {
              setTab('send');
              setIsSent(false);
              setError(null);
            }}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
              tab === 'send'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Units</span>
          </button>
          <button
            onClick={() => {
              setTab('receive');
              setIsSent(false);
              setError(null);
            }}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
              tab === 'receive'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Receive</span>
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2 text-xs text-rose-800 dark:text-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: SEND */}
        {tab === 'send' && !isSent && (
          <div className="mt-4 space-y-4 text-xs">
            <div>
              <label className="block text-slate-500 mb-1 font-medium">
                Recipient Phone or Email
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="+254 712 345 678 or email"
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
              />
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[11px] text-slate-400">Quick Pick:</span>
                {otherInvestors.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setRecipient(user.phone)}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  >
                    {user.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-500 font-medium">Units to Send</span>
                <span className="text-slate-400">
                  Available: <strong>{currentUser.unitBalance.toFixed(8)} units</strong>
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.00000001"
                  min="0.00000001"
                  value={unitsStr}
                  onChange={(e) => setUnitsStr(e.target.value)}
                  placeholder="0.00000001"
                  className="w-full pl-3 pr-20 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">
                  ~KSh {estimatedKes.toFixed(2)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-500 mb-1 font-medium">Note (Optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Gift / Payment for..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Transfer Fee:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                  Free (Peer-to-peer waiver)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ledger Posting:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  Instant internal settlement
                </span>
              </div>
            </div>

            <button
              onClick={handleSend}
              className="w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition"
            >
              Send {unitsNum > 0 ? `${unitsNum} Units` : 'Units'}
            </button>
          </div>
        )}

        {/* TAB 1 SUCCESS */}
        {tab === 'send' && isSent && (
          <div className="mt-5 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Units Sent Successfully!
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {unitsNum} FEDHA units have been transferred to {recipient}.
              </p>
            </div>
            <button
              onClick={resetAndClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs"
            >
              Done
            </button>
          </div>
        )}

        {/* TAB 2: RECEIVE */}
        {tab === 'receive' && (
          <div className="mt-4 space-y-4 text-center">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800">
                <QrCode className="w-36 h-36 text-slate-900 dark:text-white" />
              </div>
              <span className="text-xs font-semibold text-slate-900 dark:text-white mt-3">
                {currentUser.name}
              </span>
              <span className="text-[11px] text-slate-500 font-mono mt-0.5">
                {currentUser.phone}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-left text-xs space-y-2 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-slate-500 block">Your Account ID:</span>
                <div className="flex items-center justify-between font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                  <span>{currentUser.id}</span>
                  <button
                    onClick={() => handleCopy(currentUser.id)}
                    className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div>
                <span className="text-slate-500 block">Phone Number:</span>
                <div className="flex items-center justify-between font-mono text-slate-900 dark:text-white mt-0.5">
                  <span>{currentUser.phone}</span>
                  <button
                    onClick={() => handleCopy(currentUser.phone)}
                    className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {copied && (
              <p className="text-xs text-emerald-600 font-semibold animate-pulse">
                Copied to clipboard!
              </p>
            )}

            <button
              onClick={resetAndClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs"
            >
              Done
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
