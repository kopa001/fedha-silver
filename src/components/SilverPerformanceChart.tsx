import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { NavRecord } from '../types';
import { TrendingUp, TrendingDown, Calendar, ShieldCheck } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';

interface SilverPerformanceChartProps {
  navHistory: NavRecord[];
}

const ChartInner: React.FC<SilverPerformanceChartProps> = ({ navHistory }) => {
  const [metric, setMetric] = useState<'silverSpot' | 'fundNav'>('silverSpot');

  // Last 30 days of data
  const data = useMemo(() => {
    if (!navHistory || navHistory.length === 0) return [];
    const last30 = navHistory.slice(-30);
    return last30.map((record) => {
      const dateObj = new Date(record.date);
      const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        date: formattedDate,
        fullDate: record.date,
        silverSpot: Number((record.silverTwapKshPerGram || 134.82).toFixed(2)),
        silverUsdOz: Number((record.silverUsdPerOz || 32.85).toFixed(2)),
        fundNav: Number((record.navPerUnit || 53.84).toFixed(4))
      };
    });
  }, [navHistory]);

  const activeValues = useMemo(() => {
    return data.map((d) => (metric === 'silverSpot' ? d.silverSpot : d.fundNav));
  }, [data, metric]);

  const minVal = activeValues.length > 0 ? Math.min(...activeValues) : 50;
  const maxVal = activeValues.length > 0 ? Math.max(...activeValues) : 55;
  const firstVal = activeValues[0] || 1;
  const lastVal = activeValues[activeValues.length - 1] || 1;
  const changeVal = lastVal - firstVal;
  const changePct = firstVal > 0 ? (changeVal / firstVal) * 100 : 0;
  const isPositive = changeVal >= 0;

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0 && payload[0]) {
      const item = payload[0].payload;
      if (!item) return null;
      return (
        <div className="rounded-xl bg-slate-900 text-white p-3 shadow-xl border border-slate-800 text-xs">
          <div className="text-slate-400 font-mono text-[10px] mb-1">{item.fullDate}</div>
          <div className="font-bold text-sm font-mono">
            {metric === 'silverSpot'
              ? `KSh ${item.silverSpot.toFixed(2)} / g`
              : `KSh ${item.fundNav.toFixed(4)} / unit`}
          </div>
          {metric === 'silverSpot' && item.silverUsdOz && (
            <div className="text-[11px] text-slate-300 font-mono mt-0.5">
              ${item.silverUsdOz.toFixed(2)} USD / oz
            </div>
          )}
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3 h-3" />
            <span>200 kg Physical Vault Backed</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Silver Price Performance
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>30-Day Historical Trend</span>
            </span>
          </div>

          <div className="flex items-baseline gap-3 mt-1.5">
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {metric === 'silverSpot'
                ? `KSh ${lastVal.toFixed(2)}`
                : `KSh ${lastVal.toFixed(4)}`}
              <span className="text-xs text-slate-400 font-normal ml-1">
                {metric === 'silverSpot' ? '/ gram' : '/ unit'}
              </span>
            </div>

            <span
              className={`text-xs font-bold flex items-center ${
                isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5 inline mr-1" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 inline mr-1" />
              )}
              {isPositive ? '+' : ''}
              {changeVal.toFixed(2)} ({isPositive ? '+' : ''}
              {changePct.toFixed(2)}% in 30d)
            </span>
          </div>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setMetric('silverSpot')}
            className={`px-3 py-1.5 rounded-md transition ${
              metric === 'silverSpot'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Silver Spot (KSh/g)
          </button>
          <button
            onClick={() => setMetric('fundNav')}
            className={`px-3 py-1.5 rounded-md transition ${
              metric === 'fundNav'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Fund NAV (KSh/unit)
          </button>
        </div>
      </div>

      {/* 30-Day High / Low Stats Bar */}
      <div className="grid grid-cols-3 gap-2 py-2 px-3 mb-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[11px]">
        <div>
          <span className="text-slate-400 block">30d Low</span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            KSh {minVal.toFixed(2)}
          </span>
        </div>
        <div className="text-center">
          <span className="text-slate-400 block">30d High</span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            KSh {maxVal.toFixed(2)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-slate-400 block">30d Range</span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            KSh {(maxVal - minVal).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Recharts Area Chart with explicit height and safe domain */}
      <div className="w-full h-[220px] min-h-[220px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={220} minHeight={200}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="silverGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2B3440" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2B3440" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E2E8F0"
                className="dark:stroke-slate-800"
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                dy={8}
                interval={4}
              />
              <YAxis
                domain={[Math.floor(minVal - 1), Math.ceil(maxVal + 1)]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                tickFormatter={(v) => `${v.toFixed(0)}`}
                dx={-4}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={metric}
                stroke="#2B3440"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#silverGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            Loading trend data...
          </div>
        )}
      </div>

      {/* Footer attribution */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span>Source: LBMA Spot Feed & Central Bank of Kenya Yield Data</span>
        <span className="text-amber-600 dark:text-amber-400 font-medium">
          Physical Backing: 200,000 g LBMA Silver
        </span>
      </div>
    </div>
  );
};

export const SilverPerformanceChart: React.FC<SilverPerformanceChartProps> = (props) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 text-center text-xs text-slate-500">
          <span>Silver trend visualizer temporarily initializing...</span>
        </div>
      }
    >
      <ChartInner {...props} />
    </ErrorBoundary>
  );
};
