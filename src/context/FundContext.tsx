import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Currency,
  CustodyHolding,
  FundConfig,
  FundNotice,
  LedgerEntry,
  LiquidityInstrument,
  NavAlertConfig,
  NavRecord,
  Order,
  PhysicalRedemption,
  Role,
  SuspiciousActivityItem,
  User
} from '../types';
import { NavEngine } from '../nav-engine/NavEngine';
import { LedgerEngine } from '../ledger/LedgerEngine';
import { FundOps, InstantQuote } from '../fund-ops/FundOps';
import { CustodyOps } from '../custody/CustodyOps';
import {
  custodyAdapter,
  fiatRailProvider,
  fxAdapter,
  silverPriceAdapter,
  treasuryRateAdapter
} from '../adapters';
import { SupportedLanguage } from '../i18n/translations';

interface FundContextType {
  // Config & Status
  config: FundConfig;
  updateConfig: (newConfig: Partial<FundConfig>) => void;
  statusMessage?: string;

  // Active User & Roles
  currentUser: User;
  allUsers: User[];
  switchUser: (userId: string) => void;
  updateCurrentUser: (updates: Partial<User>) => void;

  // NAV & Market Data
  currentNav: NavRecord;
  navHistory: NavRecord[];
  liveSilverKshPerGram: number;
  liveSilverUsdPerOz: number;
  fxRates: Record<string, number>;
  runDailyStrike: (approvalNote?: string) => NavRecord;
  refreshLivePrices: () => Promise<void>;

  // Fund transparency metrics
  ratios: ReturnType<typeof FundOps.calculateRatios>;
  liquidityInstruments: LiquidityInstrument[];
  custodyHolding: CustodyHolding;

  // Ledger & Auditing
  ledger: LedgerEngine;
  ledgerEntries: LedgerEntry[];
  verifyLedgerIntegrity: () => ReturnType<LedgerEngine['verifyIntegrity']>;
  simulateLedgerTamper: () => void;
  restoreLedger: () => void;

  // Orders & Trading
  orders: Order[];
  createInstantQuote: (type: 'subscribe' | 'redeem', amountFiat: number, currency?: Currency) => InstantQuote;
  submitSubscription: (params: {
    amountFiat: number;
    currency: Currency;
    pricingMode: 'forward' | 'instant';
    quote?: InstantQuote;
    pin: string;
    paymentMethod?: 'wallet' | 'mpesa' | 'bank_transfer';
    phoneNumber?: string;
  }) => { success: boolean; order?: Order; error?: string };
  submitRedemption: (params: {
    amountFiat: number;
    currency: Currency;
    unitsToRedeem: number;
    pin: string;
  }) => { success: boolean; order?: Order; error?: string };
  submitPhysicalRedemption: (grams: number, pin: string) => { success: boolean; request?: PhysicalRedemption; error?: string };
  physicalRedemptions: PhysicalRedemption[];
  releasePhysicalSilverByOperator: (params: {
    requestId: string;
    enteredPickupCode: string;
    measuredScaleWeightGrams: number;
    notes?: string;
  }) => { success: boolean; error?: string };

  // Transfers & Wallets
  sendUnitsToUser: (recipientPhoneOrEmail: string, unitsToSend: number, note?: string) => { success: boolean; error?: string };
  depositFiatWallet: (amountKes: number) => { success: boolean };
  withdrawFiatWallet: (amountKes: number) => { success: boolean; error?: string };

  // Controls & Storylines
  triggerCustodyMismatchSimulation: () => void;
  resolveCustodyMismatch: () => void;
  triggerCircuitBreakerSimulation: (shockPct?: number) => void;
  resetCircuitBreaker: () => void;
  triggerCapReachedSimulation: () => void;
  resetCapReachedSimulation: () => void;
  runStoryline: (storylineId: number) => void;

  // Compliance
  suspiciousActivityQueue: SuspiciousActivityItem[];
  freezeUserAccount: (userId: string, reason: string) => void;
  unfreezeUserAccount: (userId: string) => void;
  reviewKycTier: (userId: string, targetTier: 1 | 2) => void;

  // Notices & Alerts
  notices: FundNotice[];
  addNotice: (notice: Omit<FundNotice, 'id' | 'publishedAt'>) => void;
  alerts: NavAlertConfig[];
  addNavAlert: (type: 'above' | 'below' | 'pct_move', thresholdValue: number) => void;

  // Preferences & i18n
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  displayCurrencyFirst: boolean;
  toggleDisplayCurrencyFirst: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const FundContext = createContext<FundContextType | null>(null);

export const FundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial Launch Calibration & Fund Config
  const [config, setConfig] = useState<FundConfig>(() => NavEngine.calibrateLaunch({}));

  // 2. Initial NAV History (12 months)
  const [navHistory, setNavHistory] = useState<NavRecord[]>(() => NavEngine.generate12MonthNavHistory(config));
  const currentNav = navHistory[navHistory.length - 1];

  // 3. Live prices
  const [liveSilverKshPerGram, setLiveSilverKshPerGram] = useState(134.82);
  const [liveSilverUsdPerOz, setLiveSilverUsdPerOz] = useState(32.85);
  const [fxRates, setFxRates] = useState<Record<string, number>>({
    'KES/USD': 129.5,
    'KES/EUR': 140.2,
    'KES/GBP': 166.8
  });

  // 4. Initial Custody & Physical Reserve
  const [custodyHolding, setCustodyHolding] = useState<CustodyHolding>({
    id: 'CUST-BRINKS-01',
    baseFineGrams: 200_000, // 200 kg
    currentFineGrams: 200_000,
    purity: '99.9% Fine Silver (LBMA Good Delivery Standard)',
    vaultLocation: 'Brinks Vault Facility, Nairobi Westlands',
    custodianName: 'Standard Custody & Trust Kenya Ltd',
    insurancePolicy: 'Lloyds of London Syndicate #4421 - 100% Replacement Value Underwritten',
    lastAttestationDate: new Date().toISOString().split('T')[0],
    lastAttestedGrams: 200_000,
    status: 'matched',
    operatorAuditLogs: [
      {
        id: 'LOG-001',
        operatorId: 'USR-OP-01',
        operatorName: 'Juma Kiprono',
        action: 'Vault Base Reserve Audit',
        gramsAffected: 200_000,
        timestamp: '2025-11-06T09:00:00Z',
        details: 'Initial physical vault load: 200 Good Delivery 1,000 oz silver ingots verified and stamped.'
      }
    ]
  });

  // 5. Liquidity Sleeve Instruments (CBK Bills & Call Deposit)
  const [liquidityInstruments, setLiquidityInstruments] = useState<LiquidityInstrument[]>([
    {
      id: 'INST-01',
      name: 'CBK 91-Day Treasury Bill (Auction #2540)',
      type: 'treasury_bill',
      amountKsh: 6_500_000,
      yieldAnnualPct: 12.2,
      maturityDays: 42
    },
    {
      id: 'INST-02',
      name: 'CBK 182-Day Treasury Bill (Auction #2498)',
      type: 'treasury_bill',
      amountKsh: 2_800_000,
      yieldAnnualPct: 12.8,
      maturityDays: 94
    },
    {
      id: 'INST-03',
      name: 'Standard Bank Overnight Call Deposit',
      type: 'call_deposit',
      amountKsh: 1_200_000,
      yieldAnnualPct: 9.5,
      maturityDays: 1
    }
  ]);

  // Total cash sleeve value
  const totalCashSleeveKsh = liquidityInstruments.reduce((sum, item) => sum + item.amountKsh, 0);

  // 6. Users (Amina, Brian, Wanjiku, Custodian, Admin, Compliance, Auditor, + background investors)
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const seed: User[] = [
      {
        id: 'USR-AMINA',
        name: 'Amina Mwangi',
        phone: '+254 712 345 678',
        email: 'amina.m@example.com',
        role: 'investor',
        pin: '1234',
        kycTier: 0,
        walletBalanceKes: 250.0,
        unitBalance: 0,
        initialInvestedKes: 0,
        isFrozen: false,
        registeredAt: '2026-10-15',
        socialRecoveryContacts: [
          { name: 'Grace (Sister)', phone: '+254 722 111 222', status: 'confirmed' },
          { name: 'Peter (Brother)', phone: '+254 733 333 444', status: 'confirmed' },
          { name: 'Mary (Colleague)', phone: '+254 700 555 666', status: 'confirmed' }
        ],
        incomePreference: 'accumulate'
      },
      {
        id: 'USR-BRIAN',
        name: 'Brian Ochieng',
        phone: '+254 720 987 654',
        email: 'brian.o@example.com',
        role: 'investor',
        pin: '1234',
        kycTier: 2,
        idNumber: '29871142',
        walletBalanceKes: 45_000.0,
        unitBalance: 168.0,
        initialInvestedKes: 8_400.0,
        firstSubscribedAt: '2026-06-12',
        isFrozen: false,
        registeredAt: '2026-05-01',
        socialRecoveryContacts: [
          { name: 'John O.', phone: '+254 711 000 111', status: 'confirmed' },
          { name: 'Sarah K.', phone: '+254 722 000 222', status: 'confirmed' },
          { name: 'Mark A.', phone: '+254 733 000 333', status: 'confirmed' }
        ],
        incomePreference: 'accumulate'
      },
      {
        id: 'USR-WANJIKU',
        name: 'Wanjiku Kamau',
        phone: '+254 718 555 999',
        email: 'wanjiku.k@example.com',
        role: 'investor',
        pin: '1234',
        kycTier: 2,
        idNumber: '21094833',
        walletBalanceKes: 120_000.0,
        unitBalance: 1420.0,
        initialInvestedKes: 71_000.0,
        firstSubscribedAt: '2026-01-20',
        isFrozen: false,
        registeredAt: '2026-01-10',
        socialRecoveryContacts: [],
        incomePreference: 'accumulate'
      },
      {
        id: 'USR-CUST-OP',
        name: 'Juma Kiprono',
        phone: '+254 722 444 888',
        email: 'juma.k@brinkscustody.ke',
        role: 'custodian_operator',
        pin: '1234',
        kycTier: 2,
        walletBalanceKes: 0,
        unitBalance: 0,
        initialInvestedKes: 0,
        isFrozen: false,
        registeredAt: '2025-11-01',
        socialRecoveryContacts: [],
        incomePreference: 'accumulate'
      },
      {
        id: 'USR-ADMIN',
        name: 'David Ndung’u',
        phone: '+254 721 000 999',
        email: 'david.n@fedhafund.ke',
        role: 'fund_manager',
        pin: '1234',
        kycTier: 2,
        walletBalanceKes: 50_000,
        unitBalance: 500,
        initialInvestedKes: 25_000,
        isFrozen: false,
        registeredAt: '2025-11-01',
        socialRecoveryContacts: [],
        incomePreference: 'accumulate'
      },
      {
        id: 'USR-COMPLIANCE',
        name: 'Faith Wambui',
        phone: '+254 723 888 111',
        email: 'faith.w@fedhafund.ke',
        role: 'compliance_officer',
        pin: '1234',
        kycTier: 2,
        walletBalanceKes: 0,
        unitBalance: 0,
        initialInvestedKes: 0,
        isFrozen: false,
        registeredAt: '2025-11-01',
        socialRecoveryContacts: [],
        incomePreference: 'accumulate'
      },
      {
        id: 'USR-AUDITOR',
        name: 'Grace Muthoni',
        phone: '+254 725 333 777',
        email: 'grace.m@auditfirm.ke',
        role: 'auditor',
        pin: '1234',
        kycTier: 2,
        walletBalanceKes: 0,
        unitBalance: 0,
        initialInvestedKes: 0,
        isFrozen: false,
        registeredAt: '2025-11-01',
        socialRecoveryContacts: [],
        incomePreference: 'accumulate'
      }
    ];

    // Seed 75 simulated background investors to match the 196,000 units outstanding in history
    let remainingUnits = 196_000 - 168 - 1420 - 500;
    for (let i = 1; i <= 75; i++) {
      const units = i === 75 ? remainingUnits : Math.floor(remainingUnits / (76 - i));
      remainingUnits -= units;
      seed.push({
        id: `USR-POOL-${i}`,
        name: `Investor ${i}`,
        phone: `+254 700 ${100000 + i}`,
        email: `investor${i}@example.com`,
        role: 'investor',
        pin: '1234',
        kycTier: i % 3 as any,
        walletBalanceKes: 1000 + i * 100,
        unitBalance: units,
        initialInvestedKes: units * 50,
        isFrozen: false,
        registeredAt: '2026-03-01',
        socialRecoveryContacts: [],
        incomePreference: 'accumulate'
      });
    }

    return seed;
  });

  const [currentUserId, setCurrentUserId] = useState<string>('USR-BRIAN');
  const currentUser = allUsers.find((u) => u.id === currentUserId) || allUsers[1];

  // 7. Hash-chained double entry ledger
  const [ledger] = useState<LedgerEngine>(() => {
    const engine = new LedgerEngine();
    // Genesis allocation
    engine.recordEntry({
      txType: 'custody_adjustment',
      debitAccount: 'ASSET:SILVER_VAULT',
      creditAccount: 'EQUITY:INITIAL_CAPITAL',
      amountFiat: 25_000_000,
      units: 0,
      navApplied: 50.0,
      memo: 'Initial physical deposit: 200,000 g 99.9% fine silver in Brinks Nairobi Vault',
      timestamp: '2025-11-06T09:00:00Z'
    });
    // Fund launch strike
    engine.recordEntry({
      txType: 'subscription',
      debitAccount: 'ASSET:CASH_SLEEVE',
      creditAccount: 'LIABILITY:INVESTORS_UNITS',
      amountFiat: 9_800_000,
      units: 196_000,
      navApplied: 50.0,
      memo: 'Launch subscriptions at KSh 50.00 / unit (gramsPerUnit fixed at 0.40000000 g)',
      timestamp: '2025-11-06T17:00:00Z'
    });
    return engine;
  });

  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(() => ledger.getEntries());
  const [ledgerBackup, setLedgerBackup] = useState<LedgerEntry[]>(() => ledger.getEntries());

  // 8. Orders & Redemptions
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-1001',
      userId: 'USR-BRIAN',
      userName: 'Brian Ochieng',
      type: 'subscribe',
      pricingMode: 'instant',
      amountFiat: 5000,
      currency: 'KES',
      units: 92.86478912,
      feeFiat: 25.0,
      effectiveFeePct: 0.5,
      navApplied: 53.582,
      status: 'completed',
      createdAt: '2026-11-05T10:14:00Z',
      settlementEstimate: 'Instant settlement (dealing spread 0.50% applied)'
    },
    {
      id: 'ORD-1002',
      userId: 'USR-WANJIKU',
      userName: 'Wanjiku Kamau',
      type: 'subscribe',
      pricingMode: 'forward',
      amountFiat: 20000,
      currency: 'KES',
      units: 373.27110862,
      feeFiat: 0,
      effectiveFeePct: 0,
      navApplied: 53.58,
      status: 'completed',
      createdAt: '2026-11-04T15:20:00Z',
      settlementEstimate: 'Settled at official 17:00 EAT NAV strike'
    }
  ]);

  const [physicalRedemptions, setPhysicalRedemptions] = useState<PhysicalRedemption[]>([
    {
      id: 'PHYS-001',
      userId: 'USR-BRIAN',
      userName: 'Brian Ochieng',
      userPhone: '+254 720 987 654',
      grams: 10,
      unitsDeducted: 25.0,
      pickupCode: '492817',
      status: 'ready',
      handlingFeeKsh: 350.0,
      vaultLocation: 'Brinks Vault Facility, Nairobi Westlands',
      createdAt: '2026-11-05T11:00:00Z',
      readyAt: '2026-11-05T14:00:00Z'
    }
  ]);

  // 9. Compliance Suspicious Activity Queue
  const [suspiciousActivityQueue, setSuspiciousActivityQueue] = useState<SuspiciousActivityItem[]>([
    {
      id: 'FLAG-01',
      userId: 'USR-POOL-12',
      userName: 'Investor 12',
      reason: 'Rapid micro-order structuring: 22 subscriptions under KSh 5 in 10 minutes',
      amount: 88,
      severity: 'medium',
      status: 'open',
      timestamp: '2026-11-05T16:42:00Z'
    },
    {
      id: 'FLAG-02',
      userId: 'USR-POOL-44',
      userName: 'Investor 44',
      reason: 'Large instant redemption outlier near daily fund cap threshold',
      amount: 450000,
      severity: 'high',
      status: 'investigating',
      timestamp: '2026-11-04T12:10:00Z'
    }
  ]);

  // 10. Notices & Alerts
  const [notices, setNotices] = useState<FundNotice[]>([
    {
      id: 'NOT-01',
      title: 'Monthly Fund Transparency & Vault Attestation Published',
      content:
        'The physical vault inspection for October 2026 confirmed 200,000 g of LBMA 99.9% fine silver present with zero discrepancy.',
      type: 'statutory',
      publishedAt: '2026-11-01',
      author: 'Fund Compliance & Custody Desk'
    },
    {
      id: 'NOT-02',
      title: 'CBK Treasury Bill Yield Adjustment Accrued to Cash Sleeve',
      content:
        'Indicative yield of the 10% liquidity sleeve rose to 11.62% p.a., augmenting daily NAV compounding.',
      type: 'info',
      publishedAt: '2026-11-03',
      author: 'Portfolio Management'
    }
  ]);

  const [alerts, setAlerts] = useState<NavAlertConfig[]>([
    {
      id: 'ALT-01',
      userId: 'USR-BRIAN',
      type: 'pct_move',
      thresholdValue: 2.0,
      isEnabled: true
    }
  ]);

  // UI States
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem('fedha_lang');
      return (saved as SupportedLanguage) || 'en';
    } catch {
      return 'en';
    }
  });
  const [displayCurrencyFirst, setDisplayCurrencyFirst] = useState(() => {
    try {
      return localStorage.getItem('fedha_curr_first') !== 'false';
    } catch {
      return true;
    }
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem('fedha_dark') === 'true';
    } catch {
      return false;
    }
  });

  // Sync dark mode class and storage
  useEffect(() => {
    try {
      localStorage.setItem('fedha_dark', isDarkMode ? 'true' : 'false');
    } catch {}
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    try {
      localStorage.setItem('fedha_lang', language);
    } catch {}
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem('fedha_curr_first', displayCurrencyFirst ? 'true' : 'false');
    } catch {}
  }, [displayCurrencyFirst]);

  // Live price poll on mount and every 30 seconds
  useEffect(() => {
    const fetchLive = async () => {
      try {
        const spot = await silverPriceAdapter.getSpot();
        setLiveSilverKshPerGram(spot.kshPerGram);
        setLiveSilverUsdPerOz(spot.usdPerOz);
        const fx = await fxAdapter.getAllRates();
        setFxRates(fx);
      } catch {}
    };
    fetchLive();
    const interval = setInterval(fetchLive, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate live coverage and fund ratios
  const unitsOutstanding = allUsers.reduce((sum, u) => sum + u.unitBalance, 0);
  const ratios = FundOps.calculateRatios({
    config,
    reserveFineGrams: custodyHolding.currentFineGrams,
    unitsOutstanding,
    cashSleeveValueKsh: totalCashSleeveKsh,
    currentNav: currentNav.navPerUnit
  });

  // Switch User
  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
  };

  const updateCurrentUser = (updates: Partial<User>) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ...updates } : u))
    );
  };

  const updateConfig = (newConfig: Partial<FundConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  // Refresh live spot price from adapter
  const refreshLivePrices = async () => {
    const spot = await silverPriceAdapter.getSpot();
    setLiveSilverKshPerGram(spot.kshPerGram);
    setLiveSilverUsdPerOz(spot.usdPerOz);
    const fx = await fxAdapter.getAllRates();
    setFxRates(fx);
  };

  // Instant Quote generator with 60-second price lock
  const createInstantQuote = (type: 'subscribe' | 'redeem', amountFiat: number, currency: Currency = 'KES'): InstantQuote => {
    const fxRateToKes = currency === 'KES' ? 1.0 : (fxRates[`KES/${currency}`] || 129.5);
    return FundOps.generateInstantQuote({
      type,
      amountFiat,
      currency,
      fxRateToKes,
      currentNavRecord: currentNav,
      liveSilverKshPerGram,
      config
    });
  };

  // Submit Subscription
  const submitSubscription = (params: {
    amountFiat: number;
    currency: Currency;
    pricingMode: 'forward' | 'instant';
    quote?: InstantQuote;
    pin: string;
    paymentMethod?: 'wallet' | 'mpesa' | 'bank_transfer';
    phoneNumber?: string;
  }): { success: boolean; order?: Order; error?: string } => {
    const {
      amountFiat,
      currency,
      pricingMode,
      quote,
      pin,
      paymentMethod = 'wallet',
      phoneNumber
    } = params;

    if (currentUser.isFrozen) {
      return { success: false, error: 'Your account is currently frozen. Please contact compliance.' };
    }

    if (pin !== currentUser.pin) {
      return { success: false, error: 'Incorrect 4-digit PIN. Please try again (Demo default is 1234).' };
    }

    // Minimum check
    const minAmount = config.minSubscriptionAmount[currency] || 0.01;
    if (amountFiat < minAmount) {
      return {
        success: false,
        error: `Minimum subscription is ${currency} ${minAmount.toFixed(2)}. You entered ${currency} ${amountFiat}.`
      };
    }

    // Fund status checks
    if (config.status === 'paused_custody_mismatch') {
      return {
        success: false,
        error: 'Subscriptions are temporarily paused due to a vault reconciliation audit alert.'
      };
    }

    if (config.status === 'capacity_reached') {
      return {
        success: false,
        error: 'Fund has reached its 200 kg silver backing limit. Your order has been placed on the waitlist.'
      };
    }

    if (pricingMode === 'instant' && config.status === 'circuit_breaker_paused') {
      return {
        success: false,
        error: 'Instant subscriptions are temporarily paused by the circuit breaker due to high market volatility. You can still use Forward Pricing.'
      };
    }

    // 60-second quote expiry check for instant mode
    if (pricingMode === 'instant' && quote) {
      if (Date.now() > quote.expiresAt) {
        return {
          success: false,
          error: 'Your 60-second price lock has expired. Please refresh the quote to confirm with current pricing.'
        };
      }
    }

    const fxRate = currency === 'KES' ? 1.0 : (fxRates[`KES/${currency}`] || 129.5);
    const amountKes = amountFiat * fxRate;

    // Check payment method balance if wallet
    if (paymentMethod === 'wallet' && currentUser.walletBalanceKes < amountKes) {
      return {
        success: false,
        error: `Insufficient wallet balance. You have KSh ${currentUser.walletBalanceKes.toFixed(2)} available. Select 'M-Pesa Express' to pay directly from your phone.`
      };
    }

    // Calculate NAV and fees
    let navApplied = currentNav.navPerUnit;
    let feeKes = 0;
    let unitsToMint = 0;

    if (pricingMode === 'instant' && quote) {
      navApplied = quote.indicativeNav;
      feeKes = quote.feeAmountKes;
      unitsToMint = quote.unitsEstimated;
    } else {
      // Forward pricing: priced at next strike (17:00 EAT), zero dealing spread
      navApplied = currentNav.navPerUnit;
      feeKes = 0; // Zero fee on forward orders
      unitsToMint = Number((amountKes / navApplied).toFixed(8));
    }

    // Capacity cap check
    if (unitsOutstanding + unitsToMint > config.maxUnits) {
      setConfig((c) => ({
        ...c,
        status: 'capacity_reached',
        statusReason: 'Unit cap reached against 200 kg physical silver base reserve.'
      }));
      return {
        success: false,
        error: `Fund cap reached! Only ${Math.max(0, config.maxUnits - unitsOutstanding).toFixed(4)} units remaining. Order waitlisted.`
      };
    }

    // Deduct wallet balance if paying with wallet, or leave wallet balance intact if paid via external M-Pesa / Bank
    const updatedWallet =
      paymentMethod === 'wallet'
        ? Number((currentUser.walletBalanceKes - amountKes).toFixed(2))
        : currentUser.walletBalanceKes;
    const updatedUnits = Number((currentUser.unitBalance + unitsToMint).toFixed(8));

    setAllUsers((users) =>
      users.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              walletBalanceKes: updatedWallet,
              unitBalance: updatedUnits,
              initialInvestedKes: u.initialInvestedKes + amountKes,
              firstSubscribedAt: u.firstSubscribedAt || new Date().toISOString()
            }
          : u
      )
    );

    const mpesaReceipt = `QK${Math.floor(10000000 + Math.random() * 90000000)}`;
    const debitAccount =
      paymentMethod === 'mpesa'
        ? 'ASSET:MPESA_COLLECTION_FLOAT'
        : paymentMethod === 'bank_transfer'
        ? 'ASSET:BANK_CLEARING_FLOAT'
        : `USER:${currentUser.id}:CASH`;

    // Record on double-entry hash-chained ledger
    const newLedgerEntry = ledger.recordEntry({
      txType: 'subscription',
      debitAccount,
      creditAccount: `FUND:UNITS_ISSUED`,
      amountFiat: amountKes,
      units: unitsToMint,
      navApplied,
      memo: `Subscription by ${currentUser.name} via ${
        paymentMethod === 'mpesa'
          ? `M-Pesa STK Push (${phoneNumber || currentUser.phone}) [Ref: ${mpesaReceipt}]`
          : paymentMethod === 'bank_transfer'
          ? 'Bank Transfer / PesaLink'
          : 'Cash Wallet'
      } (${pricingMode} pricing @ KSh ${navApplied.toFixed(4)})`
    });

    setLedgerEntries(ledger.getEntries());

    const settlementEstimate =
      paymentMethod === 'mpesa'
        ? `Settled instantly via Lipa Na M-Pesa · Receipt: ${mpesaReceipt}`
        : pricingMode === 'instant'
        ? 'Settled instantly via Dealing Sleeve'
        : 'Pending official forward NAV strike at 17:00 EAT';

    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'subscribe',
      pricingMode,
      amountFiat,
      currency,
      units: unitsToMint,
      feeFiat: feeKes / fxRate,
      effectiveFeePct: amountKes > 0 ? (feeKes / amountKes) * 100 : 0,
      navApplied,
      status: 'completed',
      createdAt: new Date().toISOString(),
      settlementEstimate
    };

    setOrders((prev) => [newOrder, ...prev]);

    return { success: true, order: newOrder };
  };

  // Submit Redemption (Cash)
  const submitRedemption = (params: {
    amountFiat: number;
    currency: Currency;
    unitsToRedeem: number;
    pin: string;
  }): { success: boolean; order?: Order; error?: string } => {
    const { amountFiat, currency, unitsToRedeem, pin } = params;

    if (currentUser.isFrozen) {
      return { success: false, error: 'Your account is currently frozen. Contact compliance.' };
    }

    if (pin !== currentUser.pin) {
      return { success: false, error: 'Incorrect 4-digit PIN.' };
    }

    if (unitsToRedeem > currentUser.unitBalance) {
      return {
        success: false,
        error: `Insufficient units. You hold ${currentUser.unitBalance.toFixed(8)} units.`
      };
    }

    const fxRate = currency === 'KES' ? 1.0 : (fxRates[`KES/${currency}`] || 129.5);
    const amountKes = amountFiat * fxRate;

    // Check daily redemption gate
    const isLargeRedemption = amountKes > config.dailyInstantRedemptionLimitUser;
    const settlementStatus = isLargeRedemption ? 'queued_t1' : 'completed';
    const settlementEstimate = isLargeRedemption
      ? 'Amount exceeds instant daily limit. Settling T+1 as fund rebalances liquidity sleeve.'
      : 'Settled same-day from KSh liquidity sleeve';

    // Anti-churn redemption fee if held < 30 days
    const isShortTerm = false; // demo default: normal fee
    const redemptionFeeKes = isShortTerm ? amountKes * config.shortTermRedemptionFee : 0;
    const netProceedsKes = amountKes - redemptionFeeKes;

    // Update balances
    const updatedUnits = currentUser.unitBalance - unitsToRedeem;
    const updatedWallet = currentUser.walletBalanceKes + netProceedsKes;

    setAllUsers((users) =>
      users.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              walletBalanceKes: Number(updatedWallet.toFixed(2)),
              unitBalance: Number(updatedUnits.toFixed(8))
            }
          : u
      )
    );

    // Ledger entry
    ledger.recordEntry({
      txType: 'redemption',
      debitAccount: `FUND:UNITS_REDEEMED`,
      creditAccount: `USER:${currentUser.id}:CASH`,
      amountFiat: netProceedsKes,
      units: unitsToRedeem,
      navApplied: currentNav.navPerUnit,
      memo: `Redemption by ${currentUser.name} (${settlementStatus})`
    });

    setLedgerEntries(ledger.getEntries());

    const newOrder: Order = {
      id: `RED-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'redeem',
      pricingMode: 'instant',
      amountFiat: netProceedsKes / fxRate,
      currency,
      units: unitsToRedeem,
      feeFiat: redemptionFeeKes / fxRate,
      effectiveFeePct: isShortTerm ? 0.5 : 0,
      navApplied: currentNav.navPerUnit,
      status: settlementStatus,
      createdAt: new Date().toISOString(),
      settlementEstimate
    };

    setOrders((prev) => [newOrder, ...prev]);

    return { success: true, order: newOrder };
  };

  // Submit Physical Silver Redemption
  const submitPhysicalRedemption = (grams: number, pin: string): { success: boolean; request?: PhysicalRedemption; error?: string } => {
    if (currentUser.kycTier < 1) {
      return {
        success: false,
        error: 'Physical silver pickup requires KYC Tier 1 verification (National ID / Passport).'
      };
    }

    if (pin !== currentUser.pin) {
      return { success: false, error: 'Incorrect 4-digit PIN.' };
    }

    if (grams < config.minPhysicalRedemptionGrams) {
      return {
        success: false,
        error: `Minimum physical silver redemption is ${config.minPhysicalRedemptionGrams} g.`
      };
    }

    // Units required = grams / gramsPerUnit
    const unitsRequired = Number((grams / config.gramsPerUnit).toFixed(8));
    if (unitsRequired > currentUser.unitBalance) {
      return {
        success: false,
        error: `You need ${unitsRequired.toFixed(4)} units to redeem ${grams} g of physical silver. You hold ${currentUser.unitBalance.toFixed(4)} units.`
      };
    }

    const pickupCode = CustodyOps.generatePickupCode();
    const handlingFeeKsh = 350.0; // Bar assay, tamper-evident security packaging, and custody vault handling

    // Deduct units
    const updatedUnits = currentUser.unitBalance - unitsRequired;
    setAllUsers((users) =>
      users.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              unitBalance: Number(updatedUnits.toFixed(8))
            }
          : u
      )
    );

    const newRequest: PhysicalRedemption = {
      id: `PHYS-${Date.now().toString().slice(-5)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      grams,
      unitsDeducted: unitsRequired,
      pickupCode,
      status: 'ready',
      handlingFeeKsh,
      vaultLocation: custodyHolding.vaultLocation,
      createdAt: new Date().toISOString(),
      readyAt: new Date().toISOString()
    };

    setPhysicalRedemptions((prev) => [newRequest, ...prev]);

    // Ledger entry
    ledger.recordEntry({
      txType: 'redemption',
      debitAccount: 'EQUITY:PHYSICAL_REDEMPTIONS',
      creditAccount: `USER:${currentUser.id}:UNITS`,
      amountFiat: grams * currentNav.silverTwapKshPerGram,
      units: unitsRequired,
      navApplied: currentNav.navPerUnit,
      memo: `Physical silver redemption: ${grams} g bar pickup requested (Code: ${pickupCode})`
    });

    setLedgerEntries(ledger.getEntries());

    return { success: true, request: newRequest };
  };

  // Custodian Operator Release Against Pickup Code
  const releasePhysicalSilverByOperator = (params: {
    requestId: string;
    enteredPickupCode: string;
    measuredScaleWeightGrams: number;
    notes?: string;
  }): { success: boolean; error?: string } => {
    const { requestId, enteredPickupCode, measuredScaleWeightGrams, notes } = params;
    const req = physicalRedemptions.find((p) => p.id === requestId);
    if (!req) return { success: false, error: 'Request not found' };

    const result = CustodyOps.verifyAndReleasePhysical({
      request: req,
      enteredPickupCode,
      operatorId: currentUser.id,
      operatorName: currentUser.name,
      measuredScaleWeightGrams,
      operatorNotes: notes
    });

    if (!result.success || !result.updatedRequest) {
      return { success: false, error: result.error };
    }

    // Update physical redemption state
    setPhysicalRedemptions((prev) =>
      prev.map((p) => (p.id === requestId ? result.updatedRequest! : p))
    );

    // Deduct physical vault reserve and log single-operator audit trail
    setCustodyHolding((prev) => ({
      ...prev,
      currentFineGrams: prev.currentFineGrams - req.grams,
      operatorAuditLogs: [
        {
          id: `LOG-${Date.now()}`,
          operatorId: currentUser.id,
          operatorName: currentUser.name,
          action: 'Physical Bar Release',
          gramsAffected: -req.grams,
          timestamp: new Date().toISOString(),
          details: `Released ${req.grams} g physical bar (Assay scale verified: ${measuredScaleWeightGrams} g) to ${req.userName} against verified pickup OTP.`
        },
        ...prev.operatorAuditLogs
      ]
    }));

    // Record on ledger
    ledger.recordEntry({
      txType: 'custody_adjustment',
      debitAccount: 'EQUITY:PHYSICAL_RELEASED',
      creditAccount: 'ASSET:SILVER_VAULT',
      amountFiat: req.grams * currentNav.silverTwapKshPerGram,
      units: 0,
      navApplied: currentNav.navPerUnit,
      memo: `Operator ${currentUser.name} released ${req.grams} g bar to ${req.userName}`
    });

    setLedgerEntries(ledger.getEntries());

    return { success: true };
  };

  // Send Units peer-to-peer
  const sendUnitsToUser = (recipientPhoneOrEmail: string, unitsToSend: number, note?: string): { success: boolean; error?: string } => {
    if (unitsToSend <= 0) return { success: false, error: 'Invalid units amount' };
    if (currentUser.unitBalance < unitsToSend) return { success: false, error: 'Insufficient units held' };

    const recipient = allUsers.find(
      (u) =>
        u.phone.replace(/\s+/g, '') === recipientPhoneOrEmail.replace(/\s+/g, '') ||
        u.email.toLowerCase() === recipientPhoneOrEmail.toLowerCase()
    );

    if (!recipient) {
      return { success: false, error: 'Recipient account not found with that phone or email.' };
    }

    if (recipient.id === currentUser.id) {
      return { success: false, error: 'You cannot send units to yourself.' };
    }

    setAllUsers((users) =>
      users.map((u) => {
        if (u.id === currentUser.id) {
          return { ...u, unitBalance: Number((u.unitBalance - unitsToSend).toFixed(8)) };
        }
        if (u.id === recipient.id) {
          return { ...u, unitBalance: Number((u.unitBalance + unitsToSend).toFixed(8)) };
        }
        return u;
      })
    );

    ledger.recordEntry({
      txType: 'unit_transfer',
      debitAccount: `USER:${currentUser.id}:UNITS`,
      creditAccount: `USER:${recipient.id}:UNITS`,
      amountFiat: unitsToSend * currentNav.navPerUnit,
      units: unitsToSend,
      navApplied: currentNav.navPerUnit,
      memo: `P2P unit transfer from ${currentUser.name} to ${recipient.name} ${note ? `(${note})` : ''}`
    });

    setLedgerEntries(ledger.getEntries());

    return { success: true };
  };

  // Wallet Deposit & Withdraw
  const depositFiatWallet = (amountKes: number) => {
    const updated = currentUser.walletBalanceKes + amountKes;
    updateCurrentUser({ walletBalanceKes: Number(updated.toFixed(2)) });
    ledger.recordEntry({
      txType: 'deposit',
      debitAccount: 'ASSET:BANK_COLLECTIONS',
      creditAccount: `USER:${currentUser.id}:CASH`,
      amountFiat: amountKes,
      units: 0,
      navApplied: currentNav.navPerUnit,
      memo: `Wallet deposit via M-Pesa rail by ${currentUser.name}`
    });
    setLedgerEntries(ledger.getEntries());
    return { success: true };
  };

  const withdrawFiatWallet = (amountKes: number) => {
    if (currentUser.walletBalanceKes < amountKes) {
      return { success: false, error: 'Insufficient wallet balance' };
    }
    const updated = currentUser.walletBalanceKes - amountKes;
    updateCurrentUser({ walletBalanceKes: Number(updated.toFixed(2)) });
    ledger.recordEntry({
      txType: 'withdrawal',
      debitAccount: `USER:${currentUser.id}:CASH`,
      creditAccount: 'ASSET:BANK_COLLECTIONS',
      amountFiat: amountKes,
      units: 0,
      navApplied: currentNav.navPerUnit,
      memo: `Wallet withdrawal to M-Pesa by ${currentUser.name}`
    });
    setLedgerEntries(ledger.getEntries());
    return { success: true };
  };

  // Run Daily NAV Strike (17:00 EAT)
  const runDailyStrike = (approvalNote?: string): NavRecord => {
    const newStrikeRecord = NavEngine.computeStrikeNav({
      reserveFineGrams: custodyHolding.currentFineGrams,
      silverTwapKshPerGram: liveSilverKshPerGram,
      silverUsdPerOz: liveSilverUsdPerOz,
      fxRateKesUsd: fxRates['KES/USD'] || 129.5,
      cashSleeveValueKsh: totalCashSleeveKsh,
      sleeveAnnualYield: 0.116,
      annualMgmtFeeRate: config.annualMgmtFee,
      unitsOutstanding,
      previousNavRecord: currentNav,
      strikeDate: new Date().toISOString()
    });

    setNavHistory((prev) => [...prev, newStrikeRecord]);

    // Record daily income and fee accruals onto ledger
    ledger.recordEntry({
      txType: 'income_accrual',
      debitAccount: 'ASSET:CASH_SLEEVE',
      creditAccount: 'INCOME:TREASURY_YIELD',
      amountFiat: newStrikeRecord.accruedIncomeKsh,
      units: 0,
      navApplied: newStrikeRecord.navPerUnit,
      memo: `Daily CBK treasury yield accrual into cash sleeve (${newStrikeRecord.date})`
    });

    ledger.recordEntry({
      txType: 'fee_accrual',
      debitAccount: 'EXPENSE:MGMT_FEE',
      creditAccount: 'LIABILITY:MANAGER_FEE_POOL',
      amountFiat: newStrikeRecord.accruedFeesKsh,
      units: 0,
      navApplied: newStrikeRecord.navPerUnit,
      memo: `Daily 0.50% p.a. fund management fee accrual (${newStrikeRecord.date})`
    });

    setLedgerEntries(ledger.getEntries());

    return newStrikeRecord;
  };

  // Ledger Verification & Tamper Simulation
  const verifyLedgerIntegrity = () => {
    return ledger.verifyIntegrity();
  };

  const simulateLedgerTamper = () => {
    setLedgerBackup([...ledger.getEntries()]);
    ledger.simulateTamperRow(1);
    setLedgerEntries(ledger.getEntries());
  };

  const restoreLedger = () => {
    ledger.restoreEntries(ledgerBackup);
    setLedgerEntries(ledger.getEntries());
  };

  // Storylines & Simulations
  const triggerCustodyMismatchSimulation = () => {
    // Simulate custodian reporting 195,000g instead of 200,000g (a 5,000g deficit)
    setCustodyHolding((prev) => ({
      ...prev,
      lastAttestedGrams: 195_000,
      status: 'mismatch_flagged'
    }));

    setConfig((prev) => ({
      ...prev,
      status: 'paused_custody_mismatch',
      statusReason: 'CRITICAL: Custodian attestation mismatch detected. Subscriptions & physical releases auto-paused.'
    }));

    setNotices((prev) => [
      {
        id: `NOT-${Date.now()}`,
        title: 'Vault Attestation Reconciliation Alert',
        content:
          'Daily reconciliation flagged a discrepancy between vault records and custodian attestation. Subscriptions and physical redemptions have been auto-paused pending inspection.',
        type: 'alert',
        publishedAt: new Date().toISOString().split('T')[0],
        author: 'Automated Attestation Guard'
      },
      ...prev
    ]);
  };

  const resolveCustodyMismatch = () => {
    setCustodyHolding((prev) => ({
      ...prev,
      lastAttestedGrams: prev.currentFineGrams,
      status: 'matched'
    }));
    setConfig((prev) => ({
      ...prev,
      status: 'active',
      statusReason: undefined
    }));
  };

  const triggerCircuitBreakerSimulation = (shockPct = 6.2) => {
    silverPriceAdapter.setSimulatedShock?.(shockPct);
    const newPrice = liveSilverKshPerGram * (1 + shockPct / 100);
    setLiveSilverKshPerGram(newPrice);
    setConfig((prev) => ({
      ...prev,
      status: 'circuit_breaker_paused',
      statusReason: `Silver moved ${shockPct > 0 ? '+' : ''}${shockPct}% in 10 minutes. Instant pricing paused; forward orders continue.`
    }));
  };

  const resetCircuitBreaker = () => {
    silverPriceAdapter.setSimulatedShock?.(0);
    setLiveSilverKshPerGram(134.82);
    setConfig((prev) => ({
      ...prev,
      status: 'active',
      statusReason: undefined
    }));
  };

  const triggerCapReachedSimulation = () => {
    // Fill units up to 490,000
    const needed = config.maxUnits - unitsOutstanding;
    setAllUsers((prev) =>
      prev.map((u) => (u.id === 'USR-WANJIKU' ? { ...u, unitBalance: u.unitBalance + needed } : u))
    );
    setConfig((prev) => ({
      ...prev,
      status: 'capacity_reached',
      statusReason: 'Fund at capacity. 200 kg base reserve 100% subscribed.'
    }));
  };

  const resetCapReachedSimulation = () => {
    // Reset Wanjiku's balance back
    setAllUsers((prev) =>
      prev.map((u) => (u.id === 'USR-WANJIKU' ? { ...u, unitBalance: 1420.0 } : u))
    );
    setConfig((prev) => ({
      ...prev,
      status: 'active',
      statusReason: undefined
    }));
  };

  // Run one of the 9 guided storylines
  const runStoryline = (id: number) => {
    switch (id) {
      case 1:
        // Amina subscribes 0.01 KSh
        setCurrentUserId('USR-AMINA');
        break;
      case 2:
        // Brian subscribes 5,000 KSh instant
        setCurrentUserId('USR-BRIAN');
        break;
      case 3:
        // Run daily strike
        runDailyStrike('Daily 17:00 EAT strike triggered');
        break;
      case 4:
        // Redemption test
        setCurrentUserId('USR-BRIAN');
        break;
      case 5:
        // Physical silver pickup
        setCurrentUserId('USR-CUST-OP');
        break;
      case 6:
        // Custody mismatch
        triggerCustodyMismatchSimulation();
        break;
      case 7:
        // Circuit breaker
        triggerCircuitBreakerSimulation();
        break;
      case 8:
        // Cap reached
        triggerCapReachedSimulation();
        break;
      case 9:
        // Social recovery
        setCurrentUserId('USR-AMINA');
        updateCurrentUser({
          recoveryRequested: {
            requestedAt: new Date().toISOString(),
            approvals: ['Grace (Sister)', 'Peter (Brother)'],
            etaHoursRemaining: 71.5
          }
        });
        break;
    }
  };

  // Compliance controls
  const freezeUserAccount = (userId: string, reason: string) => {
    setAllUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isFrozen: true } : u)));
    setSuspiciousActivityQueue((prev) =>
      prev.map((item) => (item.userId === userId ? { ...item, status: 'frozen' } : item))
    );
  };

  const unfreezeUserAccount = (userId: string) => {
    setAllUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isFrozen: false } : u)));
  };

  const reviewKycTier = (userId: string, targetTier: 1 | 2) => {
    setAllUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, kycTier: targetTier } : u)));
  };

  const addNotice = (notice: Omit<FundNotice, 'id' | 'publishedAt'>) => {
    setNotices((prev) => [
      {
        ...notice,
        id: `NOT-${Date.now()}`,
        publishedAt: new Date().toISOString().split('T')[0]
      },
      ...prev
    ]);
  };

  const addNavAlert = (type: 'above' | 'below' | 'pct_move', thresholdValue: number) => {
    setAlerts((prev) => [
      {
        id: `ALT-${Date.now()}`,
        userId: currentUser.id,
        type,
        thresholdValue,
        isEnabled: true
      },
      ...prev
    ]);
  };

  return (
    <FundContext.Provider
      value={{
        config,
        updateConfig,
        currentUser,
        allUsers,
        switchUser,
        updateCurrentUser,
        currentNav,
        navHistory,
        liveSilverKshPerGram,
        liveSilverUsdPerOz,
        fxRates,
        runDailyStrike,
        refreshLivePrices,
        ratios,
        liquidityInstruments,
        custodyHolding,
        ledger,
        ledgerEntries,
        verifyLedgerIntegrity,
        simulateLedgerTamper,
        restoreLedger,
        orders,
        createInstantQuote,
        submitSubscription,
        submitRedemption,
        submitPhysicalRedemption,
        physicalRedemptions,
        releasePhysicalSilverByOperator,
        sendUnitsToUser,
        depositFiatWallet,
        withdrawFiatWallet,
        triggerCustodyMismatchSimulation,
        resolveCustodyMismatch,
        triggerCircuitBreakerSimulation,
        resetCircuitBreaker,
        triggerCapReachedSimulation,
        resetCapReachedSimulation,
        runStoryline,
        suspiciousActivityQueue,
        freezeUserAccount,
        unfreezeUserAccount,
        reviewKycTier,
        notices,
        addNotice,
        alerts,
        addNavAlert,
        language,
        setLanguage,
        displayCurrencyFirst,
        toggleDisplayCurrencyFirst: () => setDisplayCurrencyFirst((p) => !p),
        isDarkMode,
        toggleDarkMode: () => setIsDarkMode((p) => !p)
      }}
    >
      {children}
    </FundContext.Provider>
  );
};

export const useFund = () => {
  const context = useContext(FundContext);
  if (!context) throw new Error('useFund must be used within a FundProvider');
  return context;
};
