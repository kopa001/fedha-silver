# FEDHA Silver Money Market Fund (Silver MMF)

> **"Silver-backed savings you can start with KSh 0.01."**
> **DEMO MODE. Simulated ledger. No real money or real physical silver.**

---

## 1. Executive Overview & Fund Concept

**FEDHA Silver MMF** is a production-quality, mobile-first web application modeling a **silver-backed, money-market-fund-style collective investment product**.

Investors subscribe to and redeem **FEDHA units** directly with the fund at a daily **Net Asset Value (NAV) per unit**. There is no secondary trading or order book; the fund is the counterparty, operating like a unit trust / money market fund.

### 1.1 Fixed 200 kg Physical Base Reserve
- The fund holds a fixed base reserve of **200 kg (200,000 g) of 99.9% fine silver** in dedicated vault custody with Standard Custody & Trust / Brinks High Security Vault in Nairobi, Kenya.
- **Launch Calibration (Fixed Forever):**
  - Launch NAV = **KSh 50.00**
  - Launch Silver Price = **KSh 125.00 / g**
  - `gramsPerUnit = launchNav / launchSilverKshPerGram` = **0.40000000 grams** per unit. This physical silver content is **fixed forever**.
  - Reserve Buffer = **2%** (0.02)
  - Maximum Issuable Units = `floor(200,000 g × 0.98 ÷ 0.4) = 490,000 units`.
  - Subscriptions automatically halt at capacity and direct investors to a waitlist.

### 1.2 Liquidity Sleeve & Income Engine
- **10% target allocation** is held in short-term Kenya sovereign instruments (Central Bank of Kenya 91-day and 182-day Treasury Bills plus standard overnight call deposit).
- Indicative annual yield (~11.62% p.a.) accrues daily into the cash sleeve and compounds into the daily NAV.
- Facilitates immediate same-day cash redemptions up to daily investor thresholds.

### 1.3 Honest Risk Principle
Because the unit is linked to global physical silver (LBMA spot), **the NAV is not stable and can fall as well as rise**. Silver fluctuates with global commodity markets. The fund is **never presented as guaranteed, risk-free, or capital-protected**.

---

## 2. Architecture & Project Structure

The project is structured according to domain-driven modular boundaries:

```
├── /public
│   ├── manifest.json         # PWA Manifest (standalone, icons, theme colors)
│   ├── sw.js                 # Service worker with offline cache
│   └── icon.svg              # Scalable SVG brand ingot icon
├── /src
│   ├── /types                # Domain TypeScript interfaces (Fund, NAV, Ledger, User, Orders)
│   ├── /adapters             # Swappable integration adapters with realistic mocks
│   │   ├── SilverPriceAdapter.ts   (LBMA/COMEX 15-min TWAP feed)
│   │   ├── FxAdapter.ts            (KES/USD, KES/EUR, KES/GBP)
│   │   ├── TreasuryRateAdapter.ts  (CBK Treasury Bill indicative yields)
│   │   ├── CustodyAdapter.ts       (Vault physical count & daily attestation)
│   │   ├── FiatRailProvider.ts     (M-Pesa / Bank collection & disbursement)
│   │   ├── KycProvider.ts          (National IPRS database verification)
│   │   └── OtpDeliveryProvider.ts  (In-app, push, email delivery)
│   ├── /ledger               # Double-entry, append-only, SHA-256 hash-chained ledger engine
│   ├── /nav-engine           # Launch calibration, daily 17:00 EAT strike engine, return breakdown
│   ├── /fund-ops             # Instant quotes (60s lock), ratio guards, what-if sensitivity calculator
│   ├── /custody              # Physical bar releases (OTP+QR), assay validation, mismatch auto-pause
│   ├── /i18n                 # English & Kiswahili complete; Kikuyu, Luhya, Dholuo, Kimeru best-effort
│   ├── /context              # FundContext reactive state store with 80 demo accounts
│   ├── /components           # PWA install, SVG multi-range chart, holdings donut, modals, storylines drawer
│   └── /pages                # Home, Fund, Invest, Portfolio, More, Admin, Custodian, Compliance, Auditor
```

---

## 3. Mathematical Engines & Business Logic

### 3.1 Daily NAV Strike Engine (17:00 EAT)
Every day at 17:00 EAT, the official NAV is computed:
```
silverValue  = reserveFineGrams × silverKshPerGram (15-min TWAP at strike)
cashSleeve   = liquiditySleeveMarketValue + dailyIncomeAccrual
liabilities  = dailyFeeAccrual (0.50% p.a. on gross fund value)
NAV per unit = (silverValue + cashSleeve − liabilities) / unitsOutstanding
```
- Rounded to 8 decimal places internally, 4 decimal places for display.
- Every input is stored in `nav_history` so historical NAV strikes can be audited and reproduced with 100% precision.

### 3.2 Pricing Mechanisms
1. **Forward Pricing:** Orders submitted before 16:00 EAT are settled at that day's 17:00 official strike NAV with **0.0% dealing spread**.
2. **Instant Dealing (60-Second Price Lock):** Indicative NAV calculated from live silver price move since last strike ± 0.50% dealing spread, locked for 60 seconds with live countdown timer.
3. **Micro-Purchase Fee Waiver:** Subscriptions under KSh 10.00 pay **0% fee and 0% spread** (subsidized by manager's fee pool) to support savings from **KSh 0.01**.
4. **Physical Redemption:** Investors (KYC Tier 1+) can redeem units for physical LBMA silver bars (5g, 10g, 50g) with a 6-digit OTP pickup code and QR, verified at Brinks Vault Facility Nairobi.

### 3.3 Cryptographic Hash-Chained Double-Entry Ledger
- **Append-only ledger** with SHA-256 chaining:
  `rowHash = SHA256(index | prevHash | timestamp | txType | debit | credit | amountCents | unitsNano | nav | memo)`
- Corrections are recorded via **reversing entries** (never hard deleted).
- Invariants checked continuously:
  `Sum(Investor Unit Balances) == Fund unitsOutstanding` (zero variance).
- Features an on-demand cryptographic integrity test in the Auditor Console that detects any mutated row.

---

## 4. Automated Compensating Controls (No Manual Two-Person Sign-Off)

To maintain mobile-first operational velocity, manual two-person sign-off is replaced with **automated compensating controls**:
1. **Single-Operator Audit Trail:** Custodian operator actions (physical releases, assay scale weights) are immutably logged and visible to the Auditor role in real time.
2. **Daily Vault Attestation Auto-Reconciliation:** `CustodyAdapter.getAttestation()` is compared against the system's fine grams. Any discrepancy above 0.5g **automatically pauses subscriptions and physical redemptions** and alerts Admin and Compliance.
3. **Circuit Breaker:** If silver spot moves > 5% within 15 minutes, instant orders pause automatically, while forward-priced orders continue.
4. **Coverage Guards:** Subscriptions halt if silver backing coverage falls below 100%.

> **⚠️ OPERATIONAL RISK WARNING (NO TWO-PERSON SIGN-OFF):**
> Removing manual dual-authorization increases operational risk regarding rogue operator collusion or physical theft. For live institutional production, a multi-signature physical authorization gate or biometric dual-custody vault release must be reinstated.

---

## 5. Regulatory Readiness Checklist (Kenya CMA & CBK)

Before accepting real money from the public, the fund operator must complete:
- [ ] **CMA License:** Register as a Collective Investment Scheme (CIS) / Money Market Fund under CMA Act Cap 485A.
- [ ] **Licensed Trustee & Custodian:** Execute trust deeds with a CMA-licensed bank trustee and licensed vault custodian.
- [ ] **Silver Bullion Insurance:** 100% replacement insurance with an underwriter (e.g. Lloyds of London).
- [ ] **Licensed Payment Service Provider:** Integrate with a CBK-licensed PSP for live M-Pesa C2B/B2C API rails.
- [ ] **Data Protection Commissioner (ODPC):** Register as a data controller under the Kenya Data Protection Act 2019.
- [ ] **Independent Annual Audit:** Retain an external audit firm to conduct physical vault counts and ledger reviews.

---

## 6. How to Run & Test the 5-Minute Storylines

Click the **"5-Min Storylines"** button in the header at any time:
1. **Amina Micro-Subscription:** Subscribes KSh 0.01 from wallet balance, demonstrates 8-decimal micro units and fee waiver.
2. **Brian Instant Dealing:** Subscribes KSh 5,000 with 60-second price lock and 0.50% dealing spread.
3. **Daily Strike:** Executes daily 17:00 strike, shows input breakdown, updates NAV history.
4. **Cash Redemption:** Demonstrates instant same-day payout vs T+1 settlement gate for large amounts.
5. **Physical Silver Bar Redemption:** Generates 6-digit pickup code + QR; Custodian Operator releases against assay scale verification.
6. **Vault Attestation Mismatch:** Simulates a 5,000g vault deficit, auto-pausing subscriptions until resolved.
7. **Circuit Breaker:** Simulates a 6.2% silver price spike, pausing instant orders while forward orders continue.
8. **Cap Reached:** Fills 490,000 max units, triggering capacity locks and the waitlist banner.
9. **Social Recovery:** Demonstrates recovery with 3 trusted contacts, 2 approvals, and 72-hour delay.
