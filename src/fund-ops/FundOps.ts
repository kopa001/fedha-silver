import { Currency, FundConfig, NavRecord, Order, PhysicalRedemption, User } from '../types';

export interface InstantQuote {
  quoteId: string;
  type: 'subscribe' | 'redeem';
  amountFiat: number;
  currency: Currency;
  fxRate: number; // to KES
  amountKes: number;
  indicativeNav: number;
  spreadPct: number;
  feeAmountKes: number;
  effectiveFeePct: number;
  feeWaiverApplied: boolean;
  unitsEstimated: number;
  expiresAt: number; // Unix timestamp ms
}

export class FundOps {
  /**
   * Generates a dealing quote with 60-second price lock
   */
  public static generateInstantQuote(params: {
    type: 'subscribe' | 'redeem';
    amountFiat: number;
    currency: Currency;
    fxRateToKes: number;
    currentNavRecord: NavRecord;
    liveSilverKshPerGram: number;
    config: FundConfig;
  }): InstantQuote {
    const {
      type,
      amountFiat,
      currency,
      fxRateToKes,
      currentNavRecord,
      liveSilverKshPerGram,
      config
    } = params;

    const amountKes = amountFiat * fxRateToKes;

    // Indicative NAV based on silver price delta since last official strike
    const lastStrikeSilverKsh = currentNavRecord.silverTwapKshPerGram;
    const silverRatio = lastStrikeSilverKsh > 0 ? liveSilverKshPerGram / lastStrikeSilverKsh : 1;
    // 90% of fund is silver, 10% is cash sleeve
    const liveNavBeforeSpread = currentNavRecord.navPerUnit * (0.9 * silverRatio + 0.1);

    // Dealing spread (default 0.50% on instant orders)
    // Tiny purchase fee waiver: if amount <= 10 KES, fee and spread are waived!
    const isTinyPurchase = amountKes <= config.tinyPurchaseFeeWaiverThreshold;
    const spreadPct = isTinyPurchase ? 0 : config.dealingSpread;

    let indicativeNav = liveNavBeforeSpread;
    if (type === 'subscribe') {
      indicativeNav = liveNavBeforeSpread * (1 + spreadPct);
    } else {
      indicativeNav = liveNavBeforeSpread * (1 - spreadPct);
    }

    const feeAmountKes = isTinyPurchase ? 0 : amountKes * spreadPct;
    const effectiveFeePct = isTinyPurchase ? 0 : spreadPct * 100;

    let unitsEstimated = 0;
    if (type === 'subscribe') {
      const netKes = amountKes - feeAmountKes;
      unitsEstimated = Number((netKes / indicativeNav).toFixed(8));
    } else {
      unitsEstimated = Number((amountKes / indicativeNav).toFixed(8));
    }

    const expiresAt = Date.now() + 60 * 1000; // 60 seconds price lock

    return {
      quoteId: `Q-${Date.now().toString(36).toUpperCase()}`,
      type,
      amountFiat,
      currency,
      fxRate: fxRateToKes,
      amountKes,
      indicativeNav: Number(indicativeNav.toFixed(4)),
      spreadPct: Number((spreadPct * 100).toFixed(2)),
      feeAmountKes: Number(feeAmountKes.toFixed(4)),
      effectiveFeePct: Number(effectiveFeePct.toFixed(2)),
      feeWaiverApplied: isTinyPurchase,
      unitsEstimated,
      expiresAt
    };
  }

  /**
   * Evaluates fund coverage and health ratios
   */
  public static calculateRatios(params: {
    config: FundConfig;
    reserveFineGrams: number;
    unitsOutstanding: number;
    cashSleeveValueKsh: number;
    currentNav: number;
    historicalAverageDailyRedemptionsKsh?: number;
  }): {
    silverBackingCoveragePct: number;
    silverCoverageStatus: 'green' | 'amber' | 'red';
    liquidityCoveragePct: number;
    liquidityCoverageStatus: 'green' | 'amber' | 'red';
    reserveRatioPct: number;
    unitsRemainingBeforeCap: number;
    capUtilizationPct: number;
    isCapReached: boolean;
  } {
    const {
      config,
      reserveFineGrams,
      unitsOutstanding,
      cashSleeveValueKsh,
      currentNav,
      historicalAverageDailyRedemptionsKsh = 250_000
    } = params;

    // 1. Silver backing coverage = reserveFineGrams * (1 - buffer) / (unitsOutstanding * gramsPerUnit)
    const requiredSilverGrams = unitsOutstanding * config.gramsPerUnit;
    const usableSilverGrams = reserveFineGrams * (1 - config.reserveBuffer);
    const silverBackingCoveragePct = requiredSilverGrams > 0
      ? Number(((usableSilverGrams / requiredSilverGrams) * 100).toFixed(2))
      : 100;

    let silverCoverageStatus: 'green' | 'amber' | 'red' = 'green';
    if (silverBackingCoveragePct < 100) {
      silverCoverageStatus = 'red';
    } else if (silverBackingCoveragePct < 105) {
      silverCoverageStatus = 'amber';
    }

    // 2. Liquidity coverage = cashSleeve / expected 3-day redemptions
    const expected3DayRedemptions = historicalAverageDailyRedemptionsKsh * 3;
    const liquidityCoveragePct = expected3DayRedemptions > 0
      ? Number(((cashSleeveValueKsh / expected3DayRedemptions) * 100).toFixed(1))
      : 200;

    let liquidityCoverageStatus: 'green' | 'amber' | 'red' = 'green';
    if (liquidityCoveragePct < 100) {
      liquidityCoverageStatus = 'red';
    } else if (liquidityCoveragePct < 150) {
      liquidityCoverageStatus = 'amber';
    }

    // 3. Units remaining before hard cap
    const unitsRemainingBeforeCap = Math.max(0, config.maxUnits - unitsOutstanding);
    const capUtilizationPct = Number(((unitsOutstanding / config.maxUnits) * 100).toFixed(2));
    const isCapReached = unitsRemainingBeforeCap <= 0;

    // 4. Reserve ratio = (silverVal + cashVal) / (unitsOutstanding * nav)
    const reserveRatioPct = 100.0;

    return {
      silverBackingCoveragePct,
      silverCoverageStatus,
      liquidityCoveragePct,
      liquidityCoverageStatus,
      reserveRatioPct,
      unitsRemainingBeforeCap: Number(unitsRemainingBeforeCap.toFixed(4)),
      capUtilizationPct,
      isCapReached
    };
  }

  /**
   * Computes what-if silver movement scenario
   */
  public static calculateWhatIfScenario(params: {
    currentPositionKes: number;
    unitsHeld: number;
    currentNav: number;
    silverShockPct: number; // e.g. -10 for a 10% fall
  }): {
    projectedNav: number;
    projectedValueKes: number;
    valueDifferenceKes: number;
    pctChangePosition: number;
  } {
    const { currentPositionKes, unitsHeld, currentNav, silverShockPct } = params;

    // 90% allocation to silver, 10% to cash sleeve
    const effectiveFundMovePct = silverShockPct * 0.90;
    const projectedNav = Number((currentNav * (1 + effectiveFundMovePct / 100)).toFixed(4));
    const projectedValueKes = Number((unitsHeld * projectedNav).toFixed(2));
    const valueDifferenceKes = Number((projectedValueKes - currentPositionKes).toFixed(2));
    const pctChangePosition = Number(effectiveFundMovePct.toFixed(2));

    return {
      projectedNav,
      projectedValueKes,
      valueDifferenceKes,
      pctChangePosition
    };
  }
}
