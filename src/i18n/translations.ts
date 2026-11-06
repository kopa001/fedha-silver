export type SupportedLanguage = 'en' | 'sw' | 'ki' | 'luy' | 'luo' | 'mer';

export interface LanguageMeta {
  code: SupportedLanguage;
  label: string;
  nativeName: string;
  isComplete: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', label: 'English', nativeName: 'English', isComplete: true },
  { code: 'sw', label: 'Kiswahili', nativeName: 'Kiswahili', isComplete: true },
  { code: 'ki', label: 'Kikuyu', nativeName: 'Gĩkũyũ (needs review)', isComplete: false },
  { code: 'luy', label: 'Luhya', nativeName: 'Luluhya (needs review)', isComplete: false },
  { code: 'luo', label: 'Dholuo', nativeName: 'Dholuo (needs review)', isComplete: false },
  { code: 'mer', label: 'Kimeru', nativeName: 'Kĩmĩrũ (needs review)', isComplete: false }
];

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  // English (Complete)
  en: {
    app_title: 'FEDHA Silver MMF',
    tagline: 'Silver-backed savings you can start with KSh 0.01.',
    demo_badge: 'DEMO. No real money or real silver.',
    nav_today: "Today's NAV per unit",
    strike_time: 'Daily strike at 17:00 EAT',
    silver_holding_title: 'Physical Silver Base Reserve',
    silver_reserve_desc: '200 kg (200,000 g) of 99.9% fine silver held in vault custody.',
    subscribe: 'Subscribe',
    redeem: 'Redeem',
    send_units: 'Send Units',
    receive_units: 'Receive',
    units_held: 'FEDHA Units Held',
    portfolio_value: 'Total Portfolio Value',
    return_since_start: 'Total Return',
    forward_pricing: 'Forward Pricing (17:00 Strike)',
    instant_pricing: 'Instant Subscribe (60s Lock)',
    min_amount_note: 'Start with as little as KSh 0.01.',
    fee_waiver_note: 'Fee waived for small purchases under KSh 10.',
    risk_disclaimer: 'Silver prices go up and down. Past performance does not guarantee future results. This is not capital-protected.',
    fund_overview: 'Fund Transparency',
    reserve_ratio: 'Silver Backing Coverage',
    liquidity_coverage: 'Liquidity Coverage',
    units_remaining: 'Units Remaining Before Cap',
    today_in_silver: 'Today in Silver',
    switch_role: 'Switch Role',
    storylines: 'Guided 5-Min Walkthroughs'
  },

  // Kiswahili (Complete)
  sw: {
    app_title: 'FEDHA Hazina ya Fedha (Silver MMF)',
    tagline: 'Akiba inayoungwa mkono na madini ya fedha kuanzia KSh 0.01 tu.',
    demo_badge: 'MAONYESHO TU. Hakuna pesa wala fedha halisi.',
    nav_today: 'Thamani Halisi ya Sehemu Leo (NAV)',
    strike_time: 'Uamuzi wa kila siku saa 11:00 jioni (17:00 EAT)',
    silver_holding_title: 'Hifadhi ya Msingi ya Madini ya Fedha',
    silver_reserve_desc: 'Kilo 200 (gramu 200,000) za madini safi ya fedha ya 99.9% kwenye ghala salama.',
    subscribe: 'Wekeza',
    redeem: 'Toa Fedha',
    send_units: 'Tuma Sehemu',
    receive_units: 'Pokea',
    units_held: 'Sehemu za FEDHA Unazomiliki',
    portfolio_value: 'Jumla ya Thamani ya Pesa',
    return_since_start: 'Faida/Hasara Tangu Mwanzo',
    forward_pricing: 'Bei ya Baadaye (Saa 11:00 jioni)',
    instant_pricing: 'Wekeza Papo Hapo (Sekunde 60)',
    min_amount_note: 'Anza na kiasi chochote kuanzia KSh 0.01.',
    fee_waiver_note: 'Hakuna ada kwa uwekezaji wa chini ya KSh 10.',
    risk_disclaimer: 'Bei ya madini ya fedha hupanda na kushuka. Hakuna dhamana ya mtaji au faida ya uhakika.',
    fund_overview: 'Uwazi wa Mfuko',
    reserve_ratio: 'Kiwango cha Hifadhi ya Fedha',
    liquidity_coverage: 'Upatikanaji wa Pesa Taslimu',
    units_remaining: 'Sehemu Zilizobaki Kabla ya Kikomo',
    today_in_silver: 'Hali ya Leo ya Madini ya Fedha',
    switch_role: 'Badilisha Majukumu',
    storylines: 'Majaribio ya Haraka ya Dakika 5'
  },

  // Kikuyu // NEEDS NATIVE REVIEW
  ki: {
    app_title: 'FEDHA Silver MMF',
    tagline: 'Kĩgĩĩna kĩa mbeca kĩhũthagĩra betha kuuma KSh 0.01.', // NEEDS NATIVE REVIEW
    demo_badge: 'DEMO. Gũtirĩ mbeca kana betha ya ma.',
    nav_today: 'Thogora wa Kĩgĩĩna Ũmũthĩ (NAV)',
    strike_time: 'Gũthuthuria kĩa mũthenya thaa kenda cia hwaĩ-inĩ (17:00 EAT)',
    silver_holding_title: 'Betha ya Ma kĩgĩĩna-inĩ',
    silver_reserve_desc: 'Kĩro 200 cia betha thũkũmũ kĩgĩĩna-inĩ kĩa betha.',
    subscribe: 'Iga Mbeca',
    redeem: 'Ruta Mbeca',
    send_units: 'Tũma Sehemu',
    receive_units: 'Amũkĩra',
    units_held: 'Sehemu ciaku cia FEDHA',
    portfolio_value: 'Mbeca ciothe kĩgĩĩna-inĩ',
    return_since_start: 'Ũgĩĩrĩru',
    forward_pricing: 'Thogora wa Thaa Kenda',
    instant_pricing: 'Iga Rĩu Rĩu',
    min_amount_note: 'Ambia na KSh 0.01.',
    fee_waiver_note: 'Gũtirĩ marĩhi ma mbeca nini rungu rwa KSh 10.',
    risk_disclaimer: 'Thogora wa betha no ũgwe kana ũmbe. Gũtirĩ kĩĩranĩro kĩa ũgitĩri.',
    fund_overview: 'Ũhoro wa Kĩgĩĩna',
    reserve_ratio: 'Kĩgĩĩna kĩa Betha',
    liquidity_coverage: 'Mbeca cia Narua',
    units_remaining: 'Sehemu iria itigarĩte',
    today_in_silver: 'Ũhoro wa betha ũmũthĩ',
    switch_role: 'Garũra Mũtũrĩre',
    storylines: 'Mawĩra ma Mĩtũkĩ'
  },

  // Luhya // NEEDS NATIVE REVIEW
  luy: {
    app_title: 'FEDHA Silver MMF',
    tagline: 'Okhubika khwe esiliba okhurula KSh 0.01.', // NEEDS NATIVE REVIEW
    demo_badge: 'DEMO. Sibula amapesa ke khulola.',
    nav_today: 'Omuwendo kwe Sehemu Ino (NAV)',
    strike_time: 'Okhupima khwe esikono sa kumi na ndala (17:00 EAT)',
    silver_holding_title: 'Esiliba Ye Etsimbaho',
    silver_reserve_desc: 'Kilo 200 tsi’esiliba mubusolo.',
    subscribe: 'Bika Amapesa',
    redeem: 'Rula Amapesa',
    send_units: 'Ruma Sehemu',
    receive_units: 'Fumbila',
    units_held: 'Tsi-Sehemu Tsio',
    portfolio_value: 'Amapesa kosi',
    return_since_start: 'Omwonyo',
    forward_pricing: 'Omuwendo kwe Esikono',
    instant_pricing: 'Bika Hano Hano',
    min_amount_note: 'Chaka nende KSh 0.01.',
    fee_waiver_note: 'Obula olushuru khumapesa matiti rungu wa KSh 10.',
    risk_disclaimer: 'Omuwendo kwe esiliba kukwa nende okhwira. Sibula esifumo.',
    fund_overview: 'Obubololi bwe Mfuko',
    reserve_ratio: 'Esiliba Yehanyi',
    liquidity_coverage: 'Amapesa ka Narua',
    units_remaining: 'Sehemu tsisikalamu',
    today_in_silver: 'Esiliba Luno',
    switch_role: 'Chinga Okhwitsa',
    storylines: 'Emilandu chia Mangu'
  },

  // Dholuo // NEEDS NATIVE REVIEW
  luo: {
    app_title: 'FEDHA Silver MMF',
    tagline: 'Kano mar fedha ma ichako gi mana KSh 0.01.', // NEEDS NATIVE REVIEW
    demo_badge: 'DEMO. Pesa kata fedha manade kanyo onge.',
    nav_today: 'Nengo mar FEDHA Kawuono (NAV)',
    strike_time: 'Ng’ado nengo saa apar gachiel kar gigo (17:00 EAT)',
    silver_holding_title: 'Fedha Manie Kar Kano',
    silver_reserve_desc: 'Kilo 200 mag fedha maler manie kuro mar kano.',
    subscribe: 'Keti Pesa',
    redeem: 'Goli Pesa',
    send_units: 'Oor Sehemu',
    receive_units: 'Yudi',
    units_held: 'Sehemu miyudo',
    portfolio_value: 'Kwan mar pesa duto',
    return_since_start: 'Ohala / Lokruok',
    forward_pricing: 'Nengo mar saa apar gachiel',
    instant_pricing: 'Kano Sani-Sani',
    min_amount_note: 'Chak gi KSh 0.01 kende.',
    fee_waiver_note: 'Onge chudo e pesa matindo ma itie KSh 10.',
    risk_disclaimer: 'Nengo mar fedha dhi malo kendo dhi piny. Onge kwayo mar ohala.',
    fund_overview: 'Ranyisi mar Mfuko',
    reserve_ratio: 'Ranyisi mar Fedha',
    liquidity_coverage: 'Pesa manie luet',
    units_remaining: 'Sehemu modong’',
    today_in_silver: 'Lokruok mar Fedha Kawuono',
    switch_role: 'Lok migawo',
    storylines: 'Pimruok ma Miyo Ng’eyo'
  },

  // Kimeru // NEEDS NATIVE REVIEW
  mer: {
    app_title: 'FEDHA Silver MMF',
    tagline: 'Mũvango jwa betha ũrĩa ũkũmbia na KSh 0.01.', // NEEDS NATIVE REVIEW
    demo_badge: 'DEMO. Gũtĩ mbeca kana betha ya mma.',
    nav_today: 'Nthogoo ya Kĩthũmbĩ Ũmũnthĩ (NAV)',
    strike_time: 'Kũthima gwa kĩla mũthenya thaa ikũmi na ĩmwe (17:00 EAT)',
    silver_holding_title: 'Betha Ĩria Ĩrĩ Kĩgĩĩna-nĩ',
    silver_reserve_desc: 'Kĩro 200 cia betha ĩtheru mĩno kĩgĩĩna-nĩ.',
    subscribe: 'Iga Mbeca',
    redeem: 'Ruta Mbeca',
    send_units: 'Tũma Sehemu',
    receive_units: 'Kĩria',
    units_held: 'Sehemu Ciaku cia FEDHA',
    portfolio_value: 'Nthogoo Yonthe ya Mbeca',
    return_since_start: 'Ũkaru / Mũtũrĩre',
    forward_pricing: 'Nthogoo ya Thaa Ikũmi na Ĩmwe',
    instant_pricing: 'Iga Ĩndĩ Ĩndĩ',
    min_amount_note: 'Ambia na KSh 0.01.',
    fee_waiver_note: 'Gũtĩ ũtĩro bwa mbeca ndwi rungu rwa KSh 10.',
    risk_disclaimer: 'Nthogoo ya betha no ĩgwe na ĩkwambata. Gũtĩ kĩĩranĩro gĩa gĩtumi.',
    fund_overview: 'Ũtheru bwa Kĩgĩĩna',
    reserve_ratio: 'Gĩkĩro kĩa Betha',
    liquidity_coverage: 'Mbeca cia Mĩtũkĩ',
    units_remaining: 'Sehemu iria Itigarĩte',
    today_in_silver: 'Ũhoro bwa Betha Ũmũnthĩ',
    switch_role: 'Garũra Mũtegũrũkĩro',
    storylines: 'Mageni ma Mĩtũkĩ'
  }
};
