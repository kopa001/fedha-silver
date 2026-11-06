/**
 * FEDHA Silver MMF Integration Adapters
 * All external dependencies sit behind swappable adapters with realistic working mocks.
 * To integrate live production providers, replace the mock implementations below.
 */

// 1. Silver Price Adapter
export interface SilverPriceResult {
  usdPerOz: number;
  kshPerGram: number;
  retrievedAt: Date;
  source: string;
  isDemo: boolean;
  spreadToleranceOk: boolean;
}

export interface SilverPriceAdapter {
  getSpot(): Promise<SilverPriceResult>;
  getTwap(windowMinutes?: number): Promise<SilverPriceResult>;
  setSimulatedShock?(pctDelta: number): void;
}

// 2. Foreign Exchange Adapter
export interface FxAdapter {
  getRate(pair: 'KES/USD' | 'KES/EUR' | 'KES/GBP'): Promise<number>;
  getAllRates(): Promise<Record<string, number>>;
}

// 3. Treasury Rate Adapter (CBK short-term securities / call deposits)
export interface TreasuryRateResult {
  annualRate: number; // e.g. 0.125 = 12.5%
  retrievedAt: Date;
  source: string;
  tenor: '91d' | '182d' | '364d' | 'call';
  isDemo: boolean;
}

export interface TreasuryRateAdapter {
  getYield(tenor: '91d' | '182d' | '364d' | 'call'): Promise<TreasuryRateResult>;
  getBlendedSleeveRate(): Promise<number>;
}

// 4. Custody Adapter (physical silver vault)
export interface CustodyAttestation {
  fineGrams: number;
  asOf: Date;
  vaultId: string;
  vaultLocation: string;
  ref: string;
  auditorSigned: boolean;
  status: 'matched' | 'mismatch';
}

export interface CustodyAdapter {
  getAttestation(): Promise<CustodyAttestation>;
  recordRelease(params: {
    grams: number;
    pickupCode: string;
    operatorId: string;
    notes?: string;
  }): Promise<{ success: boolean; releaseRef: string; timestamp: Date }>;
  recordVaultAuditAdjustment(adjustedGrams: number, reason: string): Promise<void>;
  simulateAttestationMismatch(deltaGrams: number): void;
  clearMismatch(): void;
}

// 5. Fiat Rail Provider (M-Pesa / Pesalink / Bank rails)
export interface FiatRailLimits {
  minCollectMinor: number; // e.g. 1 cent (0.01 KES)
  maxCollectMinor: number;
  minDisburseMinor: number;
  maxDisburseMinor: number;
}

export interface FiatRailProvider {
  collect(params: {
    userId: string;
    phoneOrAccount: string;
    amountKes: number;
    rail: 'mpesa' | 'bank_transfer' | 'card';
  }): Promise<{ txId: string; status: 'settled' | 'pending'; feeKes: number }>;

  disburse(params: {
    userId: string;
    recipientPhoneOrAccount: string;
    amountKes: number;
    rail: 'mpesa' | 'bank_transfer';
  }): Promise<{ txId: string; status: 'settled' | 'pending'; feeKes: number }>;

  limits(): FiatRailLimits;
}

// 6. KYC Provider
export interface KycResult {
  tier: number;
  verified: boolean;
  status: 'approved' | 'pending' | 'rejected' | 'flagged';
  riskScore: number; // 0-100
  notes: string;
}

export interface KycProvider {
  verify(tier: number, data: { idNumber?: string; name: string; dob?: string; documentPhoto?: string }): Promise<KycResult>;
}

// 7. OTP Delivery Provider (In-app / push / email only - NO USSD/SMS)
export interface OtpDeliveryProvider {
  send(to: string, code: string, channel: 'in_app' | 'email' | 'push'): Promise<{ success: boolean; messageId: string }>;
}

// ==========================================
// MOCK IMPLEMENTATIONS (DEMO MODE)
// ==========================================

const TROY_OZ_TO_GRAMS = 31.1034768;

class MockSilverPriceAdapter implements SilverPriceAdapter {
  // Base silver price ~$32.85 / oz. In KES at ~129.50/USD => ~136 KES / gram
  private baseUsdOz = 32.85;
  private shockPct = 0;
  private lastFetchedAt: Date = new Date();
  private lastLiveSource = 'Mock LBMA / COMEX Silver Median Feed (DEMO)';

  setSimulatedShock(pctDelta: number) {
    this.shockPct = pctDelta;
  }

  async getSpot(): Promise<SilverPriceResult> {
    // Attempt live fetch from public silver commodity API if shock is 0
    if (this.shockPct === 0 && typeof window !== 'undefined') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const res = await fetch('https://api.gold-api.com/price/XAG', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.price === 'number' && data.price > 10 && data.price < 100) {
            this.baseUsdOz = Number(data.price.toFixed(4));
            this.lastLiveSource = 'Live Global Spot Silver Feed (XAG/USD)';
            this.lastFetchedAt = new Date();
          }
        }
      } catch {
        // Fallback silently to base price
      }
    }

    const usdPerOz = Number((this.baseUsdOz * (1 + this.shockPct / 100)).toFixed(4));
    const fxRate = 129.50; // KES/USD
    const kshPerGram = Number(((usdPerOz * fxRate) / TROY_OZ_TO_GRAMS).toFixed(4));

    return {
      usdPerOz,
      kshPerGram,
      retrievedAt: this.lastFetchedAt,
      source: this.shockPct !== 0 ? `Simulated Volatility Shock (${this.shockPct > 0 ? '+' : ''}${this.shockPct}%)` : this.lastLiveSource,
      isDemo: this.shockPct !== 0,
      spreadToleranceOk: true
    };
  }

  async getTwap(windowMinutes: number = 15): Promise<SilverPriceResult> {
    const spot = await this.getSpot();
    // 15-min TWAP smooths minor ticks
    return {
      ...spot,
      source: `15-min TWAP LBMA Silver Feed (${windowMinutes}m window) [${spot.source}]`
    };
  }
}

class MockFxAdapter implements FxAdapter {
  private rates = {
    'KES/USD': 129.50, // 1 USD = 129.50 KES
    'KES/EUR': 140.20, // 1 EUR = 140.20 KES
    'KES/GBP': 166.80  // 1 GBP = 166.80 KES
  };
  private lastFetchTime = 0;

  async getRate(pair: 'KES/USD' | 'KES/EUR' | 'KES/GBP'): Promise<number> {
    const all = await this.getAllRates();
    return all[pair] || this.rates[pair] || 129.50;
  }

  async getAllRates(): Promise<Record<string, number>> {
    // Attempt live fetch from open exchange rates API once every 5 minutes
    if (typeof window !== 'undefined' && Date.now() - this.lastFetchTime > 300000) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const res = await fetch('https://open.er-api.com/v6/latest/USD', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && data.rates && data.rates.KES) {
            const kes = data.rates.KES;
            const eur = data.rates.EUR || 0.92;
            const gbp = data.rates.GBP || 0.78;
            this.rates = {
              'KES/USD': Number(kes.toFixed(2)),
              'KES/EUR': Number((kes / eur).toFixed(2)),
              'KES/GBP': Number((kes / gbp).toFixed(2))
            };
            this.lastFetchTime = Date.now();
          }
        }
      } catch {
        // Fallback silently to configured benchmark rates
      }
    }
    return { ...this.rates };
  }
}

class MockTreasuryRateAdapter implements TreasuryRateAdapter {
  // Central Bank of Kenya 91-day T-Bill rate benchmark ~12.2% p.a.
  async getYield(tenor: '91d' | '182d' | '364d' | 'call'): Promise<TreasuryRateResult> {
    const rates = {
      'call': 0.095, // 9.5%
      '91d': 0.122,  // 12.2%
      '182d': 0.128, // 12.8%
      '364d': 0.134  // 13.4%
    };

    return {
      annualRate: rates[tenor],
      retrievedAt: new Date(),
      source: 'Central Bank of Kenya Indicative Auction Yield [DEMO]',
      tenor,
      isDemo: true
    };
  }

  async getBlendedSleeveRate(): Promise<number> {
    // 60% in 91d (12.2%), 25% in call (9.5%), 15% in 182d (12.8%)
    return 0.11615; // ~11.62% p.a. indicative cash sleeve yield
  }
}

class MockCustodyAdapter implements CustodyAdapter {
  private baseHolding = 200000; // 200 kg
  private simulatedDelta = 0; // For mismatch simulation

  simulateAttestationMismatch(deltaGrams: number) {
    this.simulatedDelta = deltaGrams;
  }

  clearMismatch() {
    this.simulatedDelta = 0;
  }

  async getAttestation(): Promise<CustodyAttestation> {
    const fineGrams = this.baseHolding + this.simulatedDelta;
    return {
      fineGrams,
      asOf: new Date(),
      vaultId: 'VAULT-NBO-01',
      vaultLocation: 'Brinks Vault Facility, Nairobi Westlands',
      ref: `ATT-${Date.now().toString(36).toUpperCase()}`,
      auditorSigned: true,
      status: this.simulatedDelta === 0 ? 'matched' : 'mismatch'
    };
  }

  async recordRelease(params: {
    grams: number;
    pickupCode: string;
    operatorId: string;
    notes?: string;
  }): Promise<{ success: boolean; releaseRef: string; timestamp: Date }> {
    this.baseHolding -= params.grams;
    return {
      success: true,
      releaseRef: `REL-PHYS-${Date.now()}`,
      timestamp: new Date()
    };
  }

  async recordVaultAuditAdjustment(adjustedGrams: number, reason: string): Promise<void> {
    this.baseHolding = adjustedGrams;
  }
}

class MockFiatRailProvider implements FiatRailProvider {
  async collect(params: {
    userId: string;
    phoneOrAccount: string;
    amountKes: number;
    rail: 'mpesa' | 'bank_transfer' | 'card';
  }): Promise<{ txId: string; status: 'settled' | 'pending'; feeKes: number }> {
    return {
      txId: `PAY-COL-${Date.now()}`,
      status: 'settled',
      feeKes: 0 // Mock zero fee for demo micro-subs
    };
  }

  async disburse(params: {
    userId: string;
    recipientPhoneOrAccount: string;
    amountKes: number;
    rail: 'mpesa' | 'bank_transfer';
  }): Promise<{ txId: string; status: 'settled' | 'pending'; feeKes: number }> {
    return {
      txId: `PAY-DISB-${Date.now()}`,
      status: 'settled',
      feeKes: 0
    };
  }

  limits(): FiatRailLimits {
    return {
      minCollectMinor: 1, // 0.01 KES
      maxCollectMinor: 50000000, // 500,000 KES
      minDisburseMinor: 1,
      maxDisburseMinor: 30000000
    };
  }
}

class MockKycProvider implements KycProvider {
  async verify(tier: number, data: { idNumber?: string; name: string; dob?: string }): Promise<KycResult> {
    return {
      tier,
      verified: true,
      status: 'approved',
      riskScore: 12,
      notes: `Tier ${tier} validated via simulated National IPRS database`
    };
  }
}

class MockOtpDeliveryProvider implements OtpDeliveryProvider {
  async send(to: string, code: string, channel: 'in_app' | 'email' | 'push'): Promise<{ success: boolean; messageId: string }> {
    return {
      success: true,
      messageId: `MSG-OTP-${Date.now()}`
    };
  }
}

// Export singleton instances
export const silverPriceAdapter = new MockSilverPriceAdapter();
export const fxAdapter = new MockFxAdapter();
export const treasuryRateAdapter = new MockTreasuryRateAdapter();
export const custodyAdapter = new MockCustodyAdapter();
export const fiatRailProvider = new MockFiatRailProvider();
export const kycProvider = new MockKycProvider();
export const otpDeliveryProvider = new MockOtpDeliveryProvider();
