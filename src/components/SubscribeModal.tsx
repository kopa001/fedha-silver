import React, { useState, useEffect } from 'react';
import { useFund } from '../context/FundContext';
import { Currency } from '../types';
import { InstantQuote } from '../fund-ops/FundOps';
import confetti from 'canvas-confetti';
import {
  X,
  Clock,
  Zap,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
  Smartphone,
  Wallet,
  Building,
  KeyRound,
  Sparkles,
  Loader2
} from 'lucide-react';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscribeModal: React.FC<SubscribeModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    config,
    currentNav,
    fxRates,
    createInstantQuote,
    submitSubscription
  } = useFund();

  const [currency, setCurrency] = useState<Currency>('KES');
  const [amountStr, setAmountStr] = useState<string>('0.01'); // Default minimum
  const [pricingMode, setPricingMode] = useState<'forward' | 'instant'>('forward');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'wallet' | 'bank_transfer'>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState<string>(currentUser.phone || '+254 712 345 678');
  const [quote, setQuote] = useState<InstantQuote | null>(null);
  const [quoteSecondsLeft, setQuoteSecondsLeft] = useState<number>(60);
  const [pin, setPin] = useState<string>(currentUser.pin || '1234');
  const [step, setStep] = useState<'amount' | 'confirm' | 'processing' | 'success'>('amount');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  // Sync phone when user changes
  useEffect(() => {
    if (currentUser.phone) {
      setPhoneNumber(currentUser.phone);
    }
    if (currentUser.pin) {
      setPin(currentUser.pin);
    }
  }, [currentUser]);

  const amountNum = parseFloat(amountStr) || 0;
  const fxRate = currency === 'KES' ? 1.0 : (fxRates[`KES/${currency}`] || 129.5);
  const amountKes = amountNum * fxRate;

  // Refresh 60-second quote when in instant mode
  useEffect(() => {
    if (isOpen && pricingMode === 'instant' && amountNum >= 0.01) {
      const q = createInstantQuote('subscribe', amountNum, currency);
      setQuote(q);
      setQuoteSecondsLeft(60);
    }
  }, [isOpen, pricingMode, amountNum, currency]);

  // 60-second countdown timer for instant quote
  useEffect(() => {
    if (!quote || pricingMode !== 'instant') return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((quote.expiresAt - Date.now()) / 1000));
      setQuoteSecondsLeft(remaining);
      if (remaining <= 0) {
        // Expired
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [quote, pricingMode]);

  if (!isOpen) return null;

  const quickChips = [0.01, 0.1, 1, 10, 50, 100, 500];

  // Calculated units
  const navApplied = pricingMode === 'instant' && quote ? quote.indicativeNav : currentNav.navPerUnit;
  const isTinyPurchase = amountKes <= config.tinyPurchaseFeeWaiverThreshold;
  const feeKes = pricingMode === 'instant' ? (isTinyPurchase ? 0 : amountKes * config.dealingSpread) : 0;
  const netKes = amountKes - feeKes;
  const estimatedUnits = navApplied > 0 ? Number((netKes / navApplied).toFixed(8)) : 0;
  const pureSilverGramsAdded = estimatedUnits * config.gramsPerUnit;

  const handleNextToConfirm = () => {
    setErrorMessage(null);
    if (amountNum < 0.01) {
      setErrorMessage(`Minimum subscription is ${currency} 0.01. You entered ${amountStr}.`);
      return;
    }

    if (paymentMethod === 'wallet' && amountKes > currentUser.walletBalanceKes) {
      setErrorMessage(
        `Insufficient cash wallet balance. You have KSh ${currentUser.walletBalanceKes.toFixed(2)}. Select 'M-Pesa Express' to pay directly from your handset.`
      );
      return;
    }

    setStep('confirm');
  };

  const handleExecuteSubscription = () => {
    setErrorMessage(null);

    if (paymentMethod === 'mpesa') {
      setStep('processing');
      // Simulate Safaricom STK prompt delay
      setTimeout(() => {
        executeOrder();
      }, 1200);
    } else {
      executeOrder();
    }
  };

  const executeOrder = () => {
    const result = submitSubscription({
      amountFiat: amountNum,
      currency,
      pricingMode,
      quote: quote || undefined,
      pin,
      paymentMethod,
      phoneNumber
    });

    if (result.success && result.order) {
      setCompletedOrder(result.order);
      setStep('success');
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Fallback gracefully if canvas is unavailable
      }
    } else {
      setStep('confirm');
      setErrorMessage(result.error || 'Failed to submit order');
    }
  };

  const resetAndClose = () => {
    setStep('amount');
    setErrorMessage(null);
    setCompletedOrder(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs p-3 sm:p-4 flex min-h-full items-start sm:items-center justify-center">
      <div className="w-full max-w-md max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-auto overflow-hidden">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs px-5 sm:px-6 pt-5 pb-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {step === 'success' ? 'Subscription Complete' : 'Subscribe to FEDHA MMF'}
            </h3>
            <p className="text-xs text-slate-500">Backing: 200 kg Physical Silver Reserve</p>
          </div>
          <button
            onClick={resetAndClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-5 sm:p-6 pt-4 overflow-y-auto flex-1 space-y-4 overscroll-contain">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2 text-xs text-rose-800 dark:text-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: AMOUNT & PAYMENT METHOD SELECTION */}
          {step === 'amount' && (
            <div className="space-y-4">
            {/* Pricing Mode Toggle */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1 text-xs font-semibold">
              <button
                onClick={() => setPricingMode('forward')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  pricingMode === 'forward'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Forward (17:00 Strike)</span>
              </button>
              <button
                onClick={() => setPricingMode('instant')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  pricingMode === 'instant'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant (60s Lock)</span>
              </button>
            </div>

            {/* Currency & Amount Input */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span>Amount to Invest</span>
                <span className="font-mono">
                  Min: <strong>{currency} 0.01</strong>
                </span>
              </div>

              <div className="relative flex items-center">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="absolute left-2.5 bg-slate-100 dark:bg-slate-800 text-xs font-bold py-1.5 px-2 rounded-lg text-slate-800 dark:text-slate-200 border-none outline-none focus:ring-1 focus:ring-slate-400"
                >
                  <option value="KES">KSh (KES)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>

                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  placeholder="0.01"
                  className="w-full pl-24 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                />
              </div>

              <p className="text-[11px] text-slate-500 mt-1">
                Start with as little as {currency} 0.01.
              </p>
            </div>

            {/* Quick Pick Chips */}
            <div className="flex flex-wrap gap-1.5">
              {quickChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setAmountStr(chip.toString())}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${
                    amountNum === chip
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {currency} {chip}
                </button>
              ))}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Payment Rail / Source:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition ${
                    paymentMethod === 'mpesa'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-slate-900 dark:text-white ring-1 ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1 font-bold text-emerald-600">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>M-Pesa</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">STK Push</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition ${
                    paymentMethod === 'wallet'
                      ? 'border-slate-900 bg-slate-50 dark:bg-slate-800 dark:border-slate-400 text-slate-900 dark:text-white ring-1 ring-slate-900 dark:ring-slate-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1 font-bold">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Wallet</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 font-mono">
                    KSh {currentUser.walletBalanceKes.toFixed(0)} bal
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-slate-900 bg-slate-50 dark:bg-slate-800 dark:border-slate-400 text-slate-900 dark:text-white ring-1 ring-slate-900 dark:ring-slate-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1 font-bold">
                    <Building className="w-3.5 h-3.5" />
                    <span>Bank</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">PesaLink</span>
                </button>
              </div>

              {paymentMethod === 'mpesa' && (
                <div className="mt-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <span className="text-slate-500">M-Pesa Handset:</span>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="font-mono font-semibold text-slate-900 dark:text-white bg-transparent text-right outline-none"
                    placeholder="+254 7XX XXX XXX"
                  />
                </div>
              )}
            </div>

            {/* Live Units Conversion Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Units to Receive:</span>
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {estimatedUnits.toFixed(8)} units
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-500">
                <span>Silver Backing Credited:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {pureSilverGramsAdded.toFixed(4)} g pure Ag
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-500">
                <span>NAV Strike Applied:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  KSh {navApplied.toFixed(4)}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-500">
                <span>Fee / Dealing Spread:</span>
                <span className="font-mono">
                  {isTinyPurchase || pricingMode === 'forward' ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Waived (KSh 0.00 · 0.0%)
                    </span>
                  ) : (
                    <span>KSh {feeKes.toFixed(2)} (0.50%)</span>
                  )}
                </span>
              </div>

              {pricingMode === 'instant' && quote && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>60s Price Lock Active:</span>
                  </span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {quoteSecondsLeft}s remaining
                  </span>
                </div>
              )}
            </div>

            {/* First-subscription Risk Disclosure Card */}
            <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" />
              <div>
                <strong>Honest Risk Notice:</strong> Silver prices rise and fall based on global commodity markets. This fund is not capital-protected and does not promise guaranteed yields.
              </div>
            </div>

            <button
              onClick={handleNextToConfirm}
              className="w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-200 transition flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Continue to Confirmation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: CONFIRMATION & PIN */}
        {step === 'confirm' && (
          <div className="mt-4 space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Amount to Pay:</span>
                <span className="font-bold font-mono text-sm text-slate-900 dark:text-white">
                  {currency} {amountNum.toFixed(2)} (KSh {amountKes.toFixed(2)})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Rail:</span>
                <span className="font-semibold capitalize text-slate-900 dark:text-white flex items-center gap-1">
                  {paymentMethod === 'mpesa' ? (
                    <>
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>M-Pesa STK ({phoneNumber})</span>
                    </>
                  ) : paymentMethod === 'wallet' ? (
                    <>
                      <Wallet className="w-3.5 h-3.5" />
                      <span>KSh Cash Wallet</span>
                    </>
                  ) : (
                    <>
                      <Building className="w-3.5 h-3.5" />
                      <span>Bank Transfer</span>
                    </>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pricing Mechanism:</span>
                <span className="font-medium capitalize text-slate-900 dark:text-white">
                  {pricingMode} pricing ({pricingMode === 'forward' ? '17:00 EAT strike' : '60s lock'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">NAV Used:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  KSh {navApplied.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Units to Mint:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  +{estimatedUnits.toFixed(8)} units
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Silver Backing:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  +{pureSilverGramsAdded.toFixed(4)} g pure Ag (LBMA 99.9%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Effective Fee:</span>
                <span className="font-mono">
                  {isTinyPurchase ? 'KSh 0.00 (Fee waived)' : `KSh ${feeKes.toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* PIN Entry with convenient autofill */}
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-1.5">
                <label className="font-medium">
                  Enter 4-Digit Security PIN
                </label>
                <button
                  type="button"
                  onClick={() => setPin('1234')}
                  className="text-[11px] text-amber-600 hover:text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Autofill PIN (1234)</span>
                </button>
              </div>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="1234"
                className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-lg font-mono tracking-widest text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setStep('amount')}
                className="w-1/3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Back
              </button>
              <button
                onClick={handleExecuteSubscription}
                className="w-2/3 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-slate-200 flex items-center justify-center gap-1.5"
              >
                {paymentMethod === 'mpesa' ? (
                  <>
                    <Smartphone className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                    <span>Pay with M-Pesa</span>
                  </>
                ) : (
                  <span>Confirm & Invest</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2.5: PROCESSING / M-PESA STK PUSH ANIMATION */}
        {step === 'processing' && (
          <div className="py-10 text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-200 dark:border-emerald-950 animate-ping opacity-30" />
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                M-Pesa STK Push Sent
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Prompt sent to <strong>{phoneNumber}</strong>. Please enter your PIN on your mobile device to complete payment.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 'success' && (
          <div className="mt-5 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Units Credited Successfully!
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Your investment is recorded on the double-entry hash-chained fund ledger.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {completedOrder?.id || 'ORD-COMPLETED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Units Added:</span>
                <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  +{estimatedUnits.toFixed(8)} units
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Silver Backing:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  +{pureSilverGramsAdded.toFixed(4)} g pure Ag
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Units Held:</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">
                  {currentUser.unitBalance.toFixed(8)} units
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Settlement Note:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px] truncate max-w-[200px]">
                  {completedOrder?.settlementEstimate || 'Settled'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Recorded on SHA-256 Hash-Chained Fund Ledger</span>
              </div>
            </div>

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
