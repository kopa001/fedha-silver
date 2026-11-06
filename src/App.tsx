import React, { useState } from 'react';
import { FundProvider, useFund } from './context/FundContext';
import { Header } from './components/Header';
import { OfflineIndicator } from './components/PWAInstallButton';
import { StorylineDrawer } from './components/StorylineDrawer';
import { HomeView } from './pages/HomeView';
import { FundView } from './pages/FundView';
import { InvestView } from './pages/InvestView';
import { PortfolioView } from './pages/PortfolioView';
import { MoreView } from './pages/MoreView';
import { AdminConsole } from './pages/AdminConsole';
import { CustodianConsole } from './pages/CustodianConsole';
import { ComplianceConsole } from './pages/ComplianceConsole';
import { AuditorConsole } from './pages/AuditorConsole';
import { SubscribeModal } from './components/SubscribeModal';
import { RedeemModal } from './components/RedeemModal';
import { SendReceiveModal } from './components/SendReceiveModal';
import {
  Home,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Menu,
  Sliders,
  Vault,
  ShieldAlert,
  FileSearch,
  Sparkles
} from 'lucide-react';

type TabType =
  | 'home'
  | 'fund'
  | 'invest'
  | 'portfolio'
  | 'more'
  | 'admin'
  | 'custodian'
  | 'compliance'
  | 'auditor';

const AppContent: React.FC = () => {
  const { currentUser } = useFund();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isStorylineOpen, setIsStorylineOpen] = useState<boolean>(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState<boolean>(false);
  const [isRedeemOpen, setIsRedeemOpen] = useState<boolean>(false);
  const [sendReceiveState, setSendReceiveState] = useState<{ open: boolean; tab: 'send' | 'receive' }>({
    open: false,
    tab: 'send'
  });

  const handleRoleTabNavigate = (role: string) => {
    if (role === 'admin') setActiveTab('admin');
    else if (role === 'custodian') setActiveTab('custodian');
    else if (role === 'compliance') setActiveTab('compliance');
    else if (role === 'auditor') setActiveTab('auditor');
    else setActiveTab('home');
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Offline PWA Indicator */}
      <OfflineIndicator />

      {/* Global Header */}
      <Header
        onOpenStorylines={() => setIsStorylineOpen(true)}
        onNavigateToRoleTab={handleRoleTabNavigate}
      />

      {/* Desktop Sub-Nav for Institutional/Desk Roles */}
      {(currentUser.role !== 'investor' ||
        activeTab === 'admin' ||
        activeTab === 'custodian' ||
        activeTab === 'compliance' ||
        activeTab === 'auditor') && (
        <div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">
                Desk Mode:
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                {currentUser.name} ({currentUser.role.replace('_', ' ')})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                  activeTab === 'home'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Investor View
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                  activeTab === 'admin'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Fund Ops (Admin)
              </button>
              <button
                onClick={() => setActiveTab('custodian')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                  activeTab === 'custodian'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Vault Custody
              </button>
              <button
                onClick={() => setActiveTab('compliance')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                  activeTab === 'compliance'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Compliance & AML
              </button>
              <button
                onClick={() => setActiveTab('auditor')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                  activeTab === 'auditor'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Auditor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'home' && (
          <HomeView
            onOpenSubscribe={() => setIsSubscribeOpen(true)}
            onOpenRedeem={() => setIsRedeemOpen(true)}
            onOpenSendReceive={(tab) => setSendReceiveState({ open: true, tab: tab || 'send' })}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === 'fund' && <FundView />}
        {activeTab === 'invest' && <InvestView />}
        {activeTab === 'portfolio' && <PortfolioView />}
        {activeTab === 'more' && <MoreView />}
        {activeTab === 'admin' && <AdminConsole />}
        {activeTab === 'custodian' && <CustodianConsole />}
        {activeTab === 'compliance' && <ComplianceConsole />}
        {activeTab === 'auditor' && <AuditorConsole />}
      </main>

      {/* Mobile-First Bottom Navigation Bar (48px tap targets, WCAG compliant) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe sm:hidden">
        <div className="grid grid-cols-5 h-16 items-center px-1">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center h-full text-[11px] font-semibold transition ${
              activeTab === 'home'
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveTab('fund')}
            className={`flex flex-col items-center justify-center h-full text-[11px] font-semibold transition ${
              activeTab === 'fund'
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <ShieldCheck className="w-5 h-5 mb-0.5" />
            <span>Fund</span>
          </button>

          <button
            onClick={() => setActiveTab('invest')}
            className={`flex flex-col items-center justify-center h-full text-[11px] font-semibold transition ${
              activeTab === 'invest'
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <div className="p-1.5 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 -mt-3 shadow-md">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="mt-0.5">Invest</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex flex-col items-center justify-center h-full text-[11px] font-semibold transition ${
              activeTab === 'portfolio'
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Wallet className="w-5 h-5 mb-0.5" />
            <span>Portfolio</span>
          </button>

          <button
            onClick={() => setActiveTab('more')}
            className={`flex flex-col items-center justify-center h-full text-[11px] font-semibold transition ${
              activeTab === 'more'
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* Storyline Drawer */}
      <StorylineDrawer
        isOpen={isStorylineOpen}
        onClose={() => setIsStorylineOpen(false)}
        onNavigateToTab={(tab) => setActiveTab(tab)}
      />

      {/* Modals */}
      <SubscribeModal
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
      />
      <RedeemModal
        isOpen={isRedeemOpen}
        onClose={() => setIsRedeemOpen(false)}
      />
      <SendReceiveModal
        isOpen={sendReceiveState.open}
        defaultTab={sendReceiveState.tab}
        onClose={() => setSendReceiveState({ open: false, tab: 'send' })}
      />
    </div>
  );
};

import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <FundProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </FundProvider>
    </ErrorBoundary>
  );
}
