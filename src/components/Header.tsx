import React, { useState } from 'react';
import { useFund } from '../context/FundContext';
import { TRANSLATIONS, SUPPORTED_LANGUAGES, SupportedLanguage } from '../i18n/translations';
import { PWAInstallButton } from './PWAInstallButton';
import {
  TrendingUp,
  TrendingDown,
  Globe,
  UserCheck,
  Moon,
  Sun,
  Coins,
  Sparkles,
  ShieldAlert,
  ChevronDown,
  Check
} from 'lucide-react';

interface HeaderProps {
  onOpenStorylines: () => void;
  onNavigateToRoleTab: (role: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenStorylines, onNavigateToRoleTab }) => {
  const {
    currentNav,
    config,
    currentUser,
    allUsers,
    switchUser,
    language,
    setLanguage,
    displayCurrencyFirst,
    toggleDisplayCurrencyFirst,
    isDarkMode,
    toggleDarkMode
  } = useFund();

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isNavPositive = currentNav.navChange24h >= 0;

  // Key demo user personas
  const keyPersonas = allUsers.filter((u) =>
    ['USR-AMINA', 'USR-BRIAN', 'USR-WANJIKU', 'USR-CUST-OP', 'USR-ADMIN', 'USR-COMPLIANCE', 'USR-AUDITOR'].includes(u.id)
  );

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      {/* Top Banner: DEMO disclaimer + Status alert */}
      <div className="bg-slate-900 text-slate-100 dark:bg-slate-950 px-3 py-1.5 text-[11px] font-medium flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wide uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            DEMO MODE
          </span>
          <span className="text-slate-300">
            Simulated ledger. No real money or real physical silver.
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-300">
          <button
            onClick={onOpenStorylines}
            className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 transition font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>5-Min Storylines</span>
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={toggleDisplayCurrencyFirst}
            className="hover:text-white transition flex items-center gap-1"
            title="Toggle between KSh-first and Units-first view"
          >
            <Coins className="w-3 h-3 text-slate-400" />
            <span>{displayCurrencyFirst ? 'KSh First' : 'Units First'}</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand & Ticker */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-white font-black text-sm shadow-sm border border-slate-700">
              Ag
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                  FEDHA
                </span>
                <span className="text-[11px] font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Silver MMF
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block truncate">
                200 kg Physical Silver Reserve
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

          {/* Today's NAV ticker */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 px-3 py-1 rounded-lg border border-slate-200/70 dark:border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 block leading-tight">
                NAV per unit
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white text-sm font-mono">
                  KSh {currentNav.navPerUnit.toFixed(4)}
                </span>
                <span
                  className={`text-xs font-semibold flex items-center ${
                    isNavPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isNavPositive ? (
                    <TrendingUp className="w-3.5 h-3.5 inline mr-0.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 inline mr-0.5" />
                  )}
                  {currentNav.navChangePct24h > 0 ? '+' : ''}
                  {currentNav.navChangePct24h.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Controls: PWA, Language, Role Switcher, Dark mode */}
        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton />

          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => {
                setIsLangMenuOpen(!isLangMenuOpen);
                setIsRoleMenuOpen(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              title="Select Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="uppercase font-semibold">{language}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-xs">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsLangMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <div>
                      <span className="font-medium">{lang.label}</span>
                      <span className="block text-[10px] text-slate-500">{lang.nativeName}</span>
                    </div>
                    {language === lang.code && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Role & Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setIsRoleMenuOpen(!isRoleMenuOpen);
                setIsLangMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Switch demo persona/role"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="max-w-[100px] truncate">{currentUser.name.split(' ')[0]}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 text-xs">
                <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Demo Persona
                </div>
                {keyPersonas.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      switchUser(user.id);
                      setIsRoleMenuOpen(false);
                      if (user.role === 'fund_manager') onNavigateToRoleTab('admin');
                      else if (user.role === 'custodian_operator') onNavigateToRoleTab('custodian');
                      else if (user.role === 'compliance_officer') onNavigateToRoleTab('compliance');
                      else if (user.role === 'auditor') onNavigateToRoleTab('auditor');
                      else onNavigateToRoleTab('home');
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition ${
                      currentUser.id === user.id ? 'bg-slate-50 dark:bg-slate-800/60 font-semibold' : ''
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {user.id === 'USR-AMINA' && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">
                            (0.01 micro)
                          </span>
                        )}
                        {user.id === 'USR-BRIAN' && (
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-normal">
                            (Instant sub)
                          </span>
                        )}
                      </div>
                      <span className="block text-[10px] text-slate-500 capitalize">
                        {user.role.replace('_', ' ')} · {user.role === 'investor' ? `KSh ${user.walletBalanceKes.toFixed(0)} bal` : 'Operational Desk'}
                      </span>
                    </div>
                    {currentUser.id === user.id && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark Mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Notice Banner if system status is non-active */}
      {config.status !== 'active' && (
        <div className="bg-amber-500 text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 animate-bounce" />
            <span>
              <strong>NOTICE:</strong> {config.statusReason || config.status}
            </span>
          </div>
          <button
            onClick={onOpenStorylines}
            className="underline hover:text-amber-100 text-[11px] shrink-0 font-bold"
          >
            Inspect in Storylines &rarr;
          </button>
        </div>
      )}
    </header>
  );
};
