import React, { useState } from 'react';
import { useFund } from '../context/FundContext';
import { Currency, PhysicalRedemption } from '../types';
import {
  X,
  Coins,
  Scale,
  Clock,
  AlertCircle,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface RedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RedeemModal: React.FC<RedeemModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    config,
    currentNav,
    submitRedemption,
    submitPhysicalRedemption
  } = useFund();

  const [redeemType, setRedeemType] = useState<'cash' | 'physical'>('cash');
  const [cashAmountStr, setCashAmountStr] = useState<string>('500');
  const [physicalGrams, setPhysicalGrams] = useState<number>(10); // 10g bar
  const [pin, setPin] = useState<string>('1234');
  const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdPhysicalRequest, setCreatedPhysicalRequest] = useState<PhysicalRedemption | null>(null);

  if (!isOpen) return null;

  const currentPositionKes = currentUser.unitBalance * currentNav.navPerUnit;
  const cashAmountNum = parseFloat(cashAmountStr) || 0;
  const unitsToRedeemCash = currentNav.navPerUnit > 0 ? cashAmountNum / currentNav.navPerUnit : 0;

  // Physical calculation
  const unitsRequiredPhysical = Number((physicalGrams / config.gramsPerUnit).toFixed(8));
  const physicalValueKes = unitsRequiredPhysical * currentNav.navPerUnit;

  const isLargeCashRedemption = cashAmountNum > config.dailyInstantRedemptionLimitUser;

  const handleNext = () => {
    setErrorMessage(null);
    if (redeemType === 'cash') {
      if (cashAmountNum < 0.01) {
        setErrorMessage('Minimum redemption is KSh 0.01.');
        return;
      }
      if (unitsToRedeemCash > currentUser.unitBalance) {
        setErrorMessage(`Insufficient units. You hold ${currentUser.unitBalance.toFixed(8)} units.`);
        return;
      }
    } else {
      if (currentUser.kycTier < 1) {
        setErrorMessage('Physical silver redemption requires verified KYC Tier 1 (National ID or Passport).');
        return;
      }
      if (physicalGrams < config.minPhysicalRedemptionGrams) {
        setErrorMessage(`Minimum physical bar redemption is ${config.minPhysicalRedemptionGrams} grams.`);
        return;
      }
      if (unitsRequiredPhysical > currentUser.unitBalance) {
        setErrorMessage(`Insufficient units. You need ${unitsRequiredPhysical.toFixed(4)} units for ${physicalGrams} g silver.`);
        return;
      }
    }
    setStep('confirm');
  };

  const handleExecute = () => {
    setErrorMessage(null);
    if (redeemType === 'cash') {
      const result = submitRedemption({
        amountFiat: cashAmountNum,
        currency: 'KES',
        unitsToRedeem: unitsToRedeemCash,
        pin
      });
      if (result.success) {
        setStep('success');
      } else {
        setErrorMessage(result.error || 'Failed to submit redemption');
      }
    } else {
      const result = submitPhysicalRedemption(physicalGrams, pin);
      if (result.success && result.request) {
        setCreatedPhysicalRequest(result.request);
        setStep('success');
      } else {
        setErrorMessage(result.error || 'Failed to request physical redemption');
      }
    }
  };

  const resetAndClose = () => {
    setStep('input');
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs p-3 sm:p-4 flex min-h-full items-start sm:items-center justify-center">
      <div className="w-full max-w-md max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-auto overflow-hidden">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs px-5 sm:px-6 pt-5 pb-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {step === 'success' ? 'Redemption Processed' : 'Redeem from FEDHA MMF'}
            </h3>
            <p className="text-xs text-slate-500">
              Holding: {currentUser.unitBalance.toFixed(4)} units (~KSh {currentPositionKes.toFixed(2)})
            </p>
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

          {/* STEP 1: INPUT */}
          {step === 'input' && (
            <div className="space-y-4">
              {/* Cash vs Physical Bar Selector */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1 text-xs font-semibold">
              <button
                onClick={() => setRedeemType('cash')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  redeemType === 'cash'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Coins className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cash to Wallet</span>
              </button>
              <button
                onClick={() => setRedeemType('physical')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  redeemType === 'physical'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                <span>Physical Silver (Bar)</span>
              </button>
            </div>

            {redeemType === 'cash' ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Redemption Value</span>
                    <button
                      type="button"
                      onClick={() => setCashAmountStr(currentPositionKes.toFixed(2))}
                      className="text-slate-900 dark:text-white font-bold underline"
                    >
                      Redeem All (KSh {currentPositionKes.toFixed(2)})
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-xs font-bold text-slate-500">
                      KSh
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={cashAmountStr}
                      onChange={(e) => setCashAmountStr(e.target.value)}
                      placeholder="0.01"
                      className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                {/* Settlement speed disclosure */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Units to Redeem:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {unitsToRedeemCash.toFixed(8)} units
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Settlement Timeline:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {isLargeCashRedemption ? (
                        <span className="text-amber-600 dark:text-amber-400">
                          T+1 Settlement (Exceeds daily instant threshold)
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Same-Day Instant (From liquidity sleeve)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Redemption Fee:</span>
                    <span className="font-mono text-emerald-600 font-semibold">
                      KSh 0.00 (Units held &gt; 30d)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Physical Silver Bar Selection */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">
                    Select Physical Silver Bar Size (Min: 5 g)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[5, 10, 50].map((grams) => (
                      <button
                        key={grams}
                        type="button"
                        onClick={() => setPhysicalGrams(grams)}
                        className={`p-2.5 text-center rounded-xl border text-xs font-bold transition ${
                          physicalGrams === grams
                            ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900'
                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div>{grams} Grams</div>
                        <div className="text-[10px] font-normal opacity-80 mt-0.5">
                          LBMA 99.9%
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Silver Bar Weight:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {physicalGrams} grams (0.4000 g/unit standard)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Units Deducted:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {unitsRequiredPhysical.toFixed(4)} units
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assay & Handling Fee:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                      KSh 350.00 (Tamper-evident vault pack)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vault Pickup Location:</span>
                    <span className="text-slate-800 dark:text-slate-200">
                      Brinks Vault, Nairobi Westlands
                    </span>
                  </div>
                </div>

                {currentUser.kycTier < 1 && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs text-amber-800 dark:text-amber-300">
                    You are currently KYC Tier 0. Physical pickup requires Tier 1 ID verification.
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-200 transition flex items-center justify-center gap-2"
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
                <span className="text-slate-500">Redemption Type:</span>
                <span className="font-bold text-slate-900 dark:text-white capitalize">
                  {redeemType === 'cash' ? 'Cash Proceeds to Wallet' : `${physicalGrams} g Physical Silver Bar`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Units to Redeem:</span>
                <span className="font-mono font-bold text-rose-600">
                  -{redeemType === 'cash' ? unitsToRedeemCash.toFixed(8) : unitsRequiredPhysical.toFixed(4)} units
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Value Proceeds:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  KSh {redeemType === 'cash' ? cashAmountNum.toFixed(2) : physicalValueKes.toFixed(2)}
                </span>
              </div>
              {redeemType === 'cash' && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Settlement Timeline:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {isLargeCashRedemption ? 'T+1 Working Day' : 'Same-Day Instant'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-500 mb-1.5 font-medium">
                Enter Security PIN (Demo: 1234)
              </label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-lg font-mono tracking-widest text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setStep('input')}
                className="w-1/3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
              >
                Back
              </button>
              <button
                onClick={handleExecute}
                className="w-2/3 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold"
              >
                Confirm Redemption
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 'success' && (
          <div className="mt-4 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {redeemType === 'cash' ? 'Cash Redemption Processed' : 'Physical Silver Bar Ready for Pickup'}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {redeemType === 'cash'
                  ? 'Your proceeds have been credited to your KSh wallet.'
                  : 'Present this pickup code or QR code at Brinks Nairobi Vault Facility.'}
              </p>
            </div>

            {redeemType === 'physical' && createdPhysicalRequest && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col items-center">
                  <QrCode className="w-24 h-24 text-slate-900 dark:text-white" />
                  <span className="text-[10px] text-slate-400 mt-1">One-Time Vault Pickup QR</span>
                </div>

                <div className="text-center">
                  <span className="text-xs text-slate-500 block">6-Digit Pickup Code:</span>
                  <span className="text-2xl font-mono font-black tracking-widest text-slate-900 dark:text-white">
                    {createdPhysicalRequest.pickupCode}
                  </span>
                </div>

                <div className="text-left text-xs space-y-1 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bar Size:</span>
                    <span className="font-bold">{createdPhysicalRequest.grams} g Fine Silver</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vault Location:</span>
                    <span>{createdPhysicalRequest.vaultLocation}</span>
                  </div>
                </div>
              </div>
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
