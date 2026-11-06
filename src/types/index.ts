export type Role = 'investor' | 'custodian_operator' | 'fund_manager' | 'compliance_officer' | 'auditor';

export type KycTier = 0 | 1 | 2;

export type Currency = 'KES' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyRate {
  pair: 'KES/USD' | 'KES/EUR' | 'KES/GBP';
  rate: number; // e.g. KES per 1 USD = 129.50
}

export interface FundConfig {
  launchNav: number; // 50.00 KES
  launchSilverKshPerGram: number; // e.g. 125.00
  launchDate: string;
  gramsPerUnit: number; // 50 / 125 = 0.40000000 (fixed forever)
  baseReserveGrams: number; // 200,000 g (200 kg)
  reserveBuffer: number; // 0.02 (2%)
  maxUnits: number; // floor(200000 * 0.98 / 0.4) = 490,000 units
  targetSilverPct: number; // 90%
  targetCashPct: number; // 10%
  annualMgmtFee: number; // 0.0050 (0.50% p.a.)
  dealingSpread: number; // 0.0050 (0.50% on instant orders)
  shortTermRedemptionFee: number; // 0.0050 (< 30 days)
  tinyPurchaseFeeWaiverThreshold: number; // 10.00 KES
  minSubscriptionAmount: Record<Currency, number>;
  dailyInstantRedemptionLimitUser: number; // e.g. 50,000 KES
  dailyFundRedemptionCap: number; // e.g. 1,000,000 KES
  minPhysicalRedemptionGrams: number; // 5 g
  circuitBreakerThresholdPct: number; // 5.0%
  circuitBreakerWindowMin: number; // 15 min
  status: 'active' | 'capacity_reached' | 'paused_custody_mismatch' | 'circuit_breaker_paused' | 'suspended_gates';
  statusReason?: string;
}

export interface NavRecord {
  id: string;
  date: string;
  strikeTime: string;
  silverTwapKshPerGram: number;
  silverUsdPerOz: number;
  fxRateKesUsd: number;
  reserveFineGrams: number;
  silverValueKsh: number;
  cashSleeveValueKsh: number;
  accruedIncomeKsh: number;
  accruedFeesKsh: number;
  liabilitiesKsh: number;
  unitsOutstanding: number;
  navPerUnit: number;
  navChange24h: number;
  navChangePct24h: number;
  returnBreakdown: {
    silverContributionPct: number;
    incomeContributionPct: number;
    feeDragPct: number;
  };
}

export interface LedgerEntry {
  id: string;
  index: number;
  timestamp: string;
  txType:
    | 'subscription'
    | 'redemption'
    | 'unit_transfer'
    | 'income_accrual'
    | 'fee_accrual'
    | 'custody_adjustment'
    | 'deposit'
    | 'withdrawal'
    | 'reversal';
  debitAccount: string;
  creditAccount: string;
  amountMinorUnits: number; // integer minor units (cents for KES: 1 KES = 100)
  unitsNano: number; // integer nano units: 1 unit = 100,000,000 (8 decimals)
  navApplied: number;
  memo: string;
  prevHash: string;
  rowHash: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  type: 'subscribe' | 'redeem';
  pricingMode: 'forward' | 'instant';
  amountFiat: number;
  currency: Currency;
  units: number;
  feeFiat: number;
  effectiveFeePct: number;
  navApplied: number;
  status: 'pending_strike' | 'completed' | 'queued_t1' | 'rejected_cap' | 'waitlisted' | 'cancelled';
  quoteLockExpiresAt?: string;
  createdAt: string;
  settlementEstimate: string;
  failureReason?: string;
}

export interface PhysicalRedemption {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  grams: number;
  unitsDeducted: number;
  pickupCode: string; // 6-digit OTP code + QR
  status: 'requested' | 'ready' | 'collected' | 'cancelled';
  handlingFeeKsh: number;
  vaultLocation: string;
  createdAt: string;
  readyAt?: string;
  collectedAt?: string;
  releasedByOperatorId?: string;
  weightAssayedGrams?: number;
  operatorNotes?: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: Role;
  pin: string;
  kycTier: KycTier;
  idNumber?: string;
  walletBalanceKes: number; // KES
  unitBalance: number; // 8 decimal precision
  initialInvestedKes: number;
  firstSubscribedAt?: string;
  isFrozen: boolean;
  registeredAt: string;
  socialRecoveryContacts: Array<{ name: string; phone: string; status: 'confirmed' | 'pending' }>;
  recoveryRequested?: { requestedAt: string; approvals: string[]; etaHoursRemaining: number };
  incomePreference: 'accumulate' | 'distribute_units';
}

export interface CustodyHolding {
  id: string;
  baseFineGrams: number; // 200,000 g
  currentFineGrams: number;
  purity: string;
  vaultLocation: string;
  custodianName: string;
  insurancePolicy: string;
  lastAttestationDate: string;
  lastAttestedGrams: number;
  status: 'matched' | 'mismatch_flagged';
  operatorAuditLogs: Array<{
    id: string;
    operatorId: string;
    operatorName: string;
    action: string;
    gramsAffected: number;
    timestamp: string;
    details: string;
  }>;
}

export interface LiquidityInstrument {
  id: string;
  name: string; // e.g. "CBK 91-Day Treasury Bill #2540"
  type: 'treasury_bill' | 'call_deposit' | 'repo';
  amountKsh: number;
  yieldAnnualPct: number;
  maturityDays: number;
}

export interface SuspiciousActivityItem {
  id: string;
  userId: string;
  userName: string;
  reason: string;
  amount: number;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'investigating' | 'dismissed' | 'frozen';
  timestamp: string;
}

export interface FundNotice {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'alert' | 'statutory' | 'capacity';
  publishedAt: string;
  author: string;
}

export interface NavAlertConfig {
  id: string;
  userId: string;
  type: 'above' | 'below' | 'pct_move';
  thresholdValue: number;
  isEnabled: boolean;
}

export interface StatementItem {
  id: string;
  month: string; // e.g. "October 2026"
  period: string;
  openingUnits: number;
  closingUnits: number;
  openingNav: number;
  closingNav: number;
  totalSubscribed: number;
  totalRedeemed: number;
  accruedIncomeEarned: number;
  netReturnPct: number;
}
