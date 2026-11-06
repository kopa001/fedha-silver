import { FundConfig, NavRecord } from '../types';

export class NavEngine {
  /**
   * Launch calibration:
   * Sets launch NAV to KSh 50.00, calculates fixed gramsPerUnit, and maxUnits based on 200kg base reserve
   */
  public static calibrateLaunch(params: {
    launchNav?: number;
    launchSilverKshPerGram?: number;
    baseReserveGrams?: number;
    reserveBuffer?: number;
  }): FundConfig {
    const launchNav = params.launchNav ?? 50.0;
    // Example: silver at launch ~125.00 KES/g
    const launchSilverKshPerGram = params.launchSilverKshPerGram ?? 125.0;
    const baseReserveGrams = params.baseReserveGrams ?? 200_000; // 200 kg
    const reserveBuffer = params.reserveBuffer ?? 0.02; // 2% buffer

    // Fixed silver content per unit (grams)
    const gramsPerUnit = Number((launchNav / launchSilverKshPerGram).toFixed(8)); // 0.40000000 g

    // Maximum units fund can ever issue against base reserve
    const maxUnits = Math.floor((baseReserveGrams * (1 - reserveBuffer)) / gramsPerUnit);

    return {
      launchNav,
      launchSilverKshPerGram,
      launchDate: '2025-11-06T17:00:00+03:00',
      gramsPerUnit,
      baseReserveGrams,
      reserveBuffer,
      maxUnits,
      targetSilverPct: 90,
      targetCashPct: 10,
      annualMgmtFee: 0.005, // 0.50% p.a.
      dealingSpread: 0.005, // 0.50%
      shortTermRedemptionFee: 0.005, // 0.50% under 30 days
      tinyPurchaseFeeWaiverThreshold: 10.0, // KSh 10.00
      minSubscriptionAmount: {
        KES: 0.01,
        USD: 0.01,
        EUR: 0.01,
        GBP: 0.01
      },
      dailyInstantRedemptionLimitUser: 50_000, // KSh 50,000 per user
      dailyFundRedemptionCap: 1_000_000, // KSh 1,000,000 across the fund
      minPhysicalRedemptionGrams: 5, // 5 grams minimum
      circuitBreakerThresholdPct: 5.0, // 5%
      circuitBreakerWindowMin: 15,
      status: 'active'
    };
  }

  /**
   * Computes official daily strike NAV per unit at 17:00 EAT
   */
  public static computeStrikeNav(params: {
    reserveFineGrams: number;
    silverTwapKshPerGram: number;
    silverUsdPerOz: number;
    fxRateKesUsd: number;
    cashSleeveValueKsh: number;
    sleeveAnnualYield: number; // e.g. 0.116
    annualMgmtFeeRate: number; // e.g. 0.005
    unitsOutstanding: number;
    previousNavRecord?: NavRecord;
    strikeDate?: string;
  }): NavRecord {
    const {
      reserveFineGrams,
      silverTwapKshPerGram,
      silverUsdPerOz,
      fxRateKesUsd,
      cashSleeveValueKsh,
      sleeveAnnualYield,
      annualMgmtFeeRate,
      unitsOutstanding,
      previousNavRecord,
      strikeDate = new Date().toISOString()
    } = params;

    // 1. Silver reserve asset value
    const silverValueKsh = reserveFineGrams * silverTwapKshPerGram;

    // 2. Daily income accrual on cash sleeve
    // Daily income = sleeveValue * yield / 365
    const accruedIncomeKsh = (cashSleeveValueKsh * sleeveAnnualYield) / 365;
    const effectiveCashSleeveKsh = cashSleeveValueKsh + accruedIncomeKsh;

    // 3. Fund gross asset value
    const grossFundValueKsh = silverValueKsh + effectiveCashSleeveKsh;

    // 4. Daily fee accrual (0.50% p.a. accrued into liabilities)
    // Daily fee = fundValue * mgmtFee / 365
    const accruedFeesKsh = (grossFundValueKsh * annualMgmtFeeRate) / 365;
    const liabilitiesKsh = accruedFeesKsh;

    // 5. Net Asset Value
    const netAssetValueKsh = grossFundValueKsh - liabilitiesKsh;

    // 6. NAV per unit (rounded to 8 decimals internally, 4 decimals display)
    const effectiveUnits = unitsOutstanding > 0 ? unitsOutstanding : 1;
    const navPerUnit = Number((netAssetValueKsh / effectiveUnits).toFixed(8));

    const prevNav = previousNavRecord ? previousNavRecord.navPerUnit : 50.0;
    const navChange24h = Number((navPerUnit - prevNav).toFixed(4));
    const navChangePct24h = Number(((navChange24h / prevNav) * 100).toFixed(2));

    // 7. Return breakdown analysis (Silver vs Cash Sleeve Income vs Fee Drag)
    const prevSilverVal = previousNavRecord
      ? (previousNavRecord.silverValueKsh / (previousNavRecord.unitsOutstanding || 1))
      : 45.0;
    const curSilverValPerUnit = silverValueKsh / effectiveUnits;
    const silverPctChange = prevSilverVal > 0 ? ((curSilverValPerUnit - prevSilverVal) / prevNav) * 100 : 0;

    const incomeContributionPct = Number(((accruedIncomeKsh / effectiveUnits / prevNav) * 100).toFixed(4));
    const feeDragPct = Number(((accruedFeesKsh / effectiveUnits / prevNav) * 100).toFixed(4));
    const silverContributionPct = Number((navChangePct24h - incomeContributionPct + feeDragPct).toFixed(4));

    return {
      id: `NAV-${strikeDate.split('T')[0]}`,
      date: strikeDate.split('T')[0],
      strikeTime: '17:00 EAT',
      silverTwapKshPerGram: Number(silverTwapKshPerGram.toFixed(4)),
      silverUsdPerOz: Number(silverUsdPerOz.toFixed(4)),
      fxRateKesUsd: Number(fxRateKesUsd.toFixed(2)),
      reserveFineGrams,
      silverValueKsh: Math.round(silverValueKsh),
      cashSleeveValueKsh: Math.round(effectiveCashSleeveKsh),
      accruedIncomeKsh: Number(accruedIncomeKsh.toFixed(2)),
      accruedFeesKsh: Number(accruedFeesKsh.toFixed(2)),
      liabilitiesKsh: Math.round(liabilitiesKsh),
      unitsOutstanding: Number(unitsOutstanding.toFixed(8)),
      navPerUnit,
      navChange24h,
      navChangePct24h,
      returnBreakdown: {
        silverContributionPct,
        incomeContributionPct,
        feeDragPct
      }
    };
  }

  /**
   * Generates 12 months of realistic daily NAV history for the DEMO
   * Captures silver volatility (e.g. rally from KSh 50 -> KSh 54, dip to KSh 48.5, steady rise to KSh 53+)
   */
  public static generate12MonthNavHistory(fundConfig: FundConfig): NavRecord[] {
    const history: NavRecord[] = [];
    const baseDate = new Date('2025-11-06T17:00:00+03:00');
    let currentNav = fundConfig.launchNav; // 50.00
    let currentSilverKsh = fundConfig.launchSilverKshPerGram; // 125.00
    const unitsOutstanding = 196_000; // ~40% of maxUnits

    // Key simulated silver events across 365 days
    for (let day = 0; day <= 365; day++) {
      const recordDate = new Date(baseDate.getTime() + day * 86400000);
      const dateStr = recordDate.toISOString().split('T')[0];

      // Simulated market waves:
      // Month 1-3: steady consolidation around 50.20 - 51.50
      // Month 4-6: silver rally up to 55.40
      // Month 7-8: healthy correction down to 49.80 (honesty rule: silver goes down too!)
      // Month 9-12: upward trend with daily CBK cash yield accrual to ~53.80
      let dailyMovePct = (Math.sin(day / 18) * 0.45 + Math.cos(day / 7) * 0.35 + (Math.random() - 0.48) * 0.4) / 100;
      if (day > 100 && day < 140) dailyMovePct += 0.0025; // Rally
      if (day > 180 && day < 220) dailyMovePct -= 0.003; // Pullback

      currentSilverKsh = currentSilverKsh * (1 + dailyMovePct);
      const usdPerOz = Number(((currentSilverKsh * 31.1034768) / 129.5).toFixed(2));

      // NAV calculation
      const prevNav = currentNav;
      // Silver component (90%) + sleeve income (0.116 / 365) - mgmt fee (0.005 / 365)
      const dailySleeveYield = (0.10 * 0.116) / 365;
      const dailyFeeDrag = 0.005 / 365;
      currentNav = Number((prevNav * (1 + dailyMovePct * 0.90 + dailySleeveYield - dailyFeeDrag)).toFixed(8));

      const navChange24h = Number((currentNav - prevNav).toFixed(4));
      const navChangePct24h = Number(((navChange24h / prevNav) * 100).toFixed(2));

      const silverContributionPct = Number((dailyMovePct * 90).toFixed(4));
      const incomeContributionPct = Number((dailySleeveYield * 100).toFixed(4));
      const feeDragPct = Number((dailyFeeDrag * 100).toFixed(4));

      history.push({
        id: `NAV-${dateStr}`,
        date: dateStr,
        strikeTime: '17:00 EAT',
        silverTwapKshPerGram: Number(currentSilverKsh.toFixed(2)),
        silverUsdPerOz: usdPerOz,
        fxRateKesUsd: 129.5,
        reserveFineGrams: 200_000,
        silverValueKsh: Math.round(200_000 * currentSilverKsh),
        cashSleeveValueKsh: Math.round(currentNav * unitsOutstanding * 0.1),
        accruedIncomeKsh: Number(((currentNav * unitsOutstanding * 0.1 * 0.116) / 365).toFixed(2)),
        accruedFeesKsh: Number(((currentNav * unitsOutstanding * 0.005) / 365).toFixed(2)),
        liabilitiesKsh: Math.round((currentNav * unitsOutstanding * 0.005) / 365),
        unitsOutstanding,
        navPerUnit: currentNav,
        navChange24h,
        navChangePct24h,
        returnBreakdown: {
          silverContributionPct,
          incomeContributionPct,
          feeDragPct
        }
      });
    }

    return history;
  }
}
