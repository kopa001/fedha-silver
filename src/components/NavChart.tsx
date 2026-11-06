import React, { useState, useMemo } from 'react';
import { NavRecord } from '../types';
import { Download, Calendar, BarChart3, TrendingUp } from 'lucide-react';

interface NavChartProps {
  navHistory: NavRecord[];
}

type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';

export const NavChart: React.FC<NavChartProps> = ({ navHistory }) => {
  const [range, setRange] = useState<TimeRange>('1Y');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'line' | 'breakdown'>('line');

  // Filter history based on range
  const filteredData = useMemo(() => {
    if (navHistory.length === 0) return [];
    const days = range === '1M' ? 30 : range === '3M' ? 90 : range === '6M' ? 180 : range === '1Y' ? 365 : navHistory.length;
    return navHistory.slice(-days);
  }, [navHistory, range]);

  // Compute SVG coordinates
  const { minNav, maxNav, points, width, height, padding } = useMemo(() => {
    const width = 800;
    const height = 260;
    const padding = { top: 20, right: 30, bottom: 30, left: 60 };

    if (filteredData.length === 0) {
      return { minNav: 45, maxNav: 55, points: '', width, height, padding };
    }

    const navs = filteredData.map((d) => d.navPerUnit);
    let minNav = Math.min(...navs);
    let maxNav = Math.max(...navs);

    // Padding to ensure line isn't hard against edges
    const span = Math.max(0.5, maxNav - minNav);
    minNav = Math.max(0, minNav - span * 0.1);
    maxNav = maxNav + span * 0.1;

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const pts = filteredData.map((d, i) => {
      const x = padding.left + (i / Math.max(1, filteredData.length - 1)) * chartW;
      const y = padding.top + chartH - ((d.navPerUnit - minNav) / (maxNav - minNav)) * chartH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return { minNav, maxNav, points: pts.join(' '), width, height, padding };
  }, [filteredData]);

  const activeRecord = hoverIndex !== null && filteredData[hoverIndex]
    ? filteredData[hoverIndex]
    : filteredData[filteredData.length - 1];

  const firstRecord = filteredData[0];
  const lastRecord = filteredData[filteredData.length - 1];
  const periodReturnPct = firstRecord && lastRecord
    ? (((lastRecord.navPerUnit - firstRecord.navPerUnit) / firstRecord.navPerUnit) * 100)
    : 0;

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Strike_Time', 'NAV_per_Unit_KES', 'Silver_TWAP_KES_g', 'Silver_USD_oz', 'Reserve_Grams', 'Liabilities_KES'];
    const rows = filteredData.map((d) => [
      d.date,
      d.strikeTime,
      d.navPerUnit.toFixed(8),
      d.silverTwapKshPerGram.toFixed(4),
      d.silverUsdPerOz.toFixed(2),
      d.reserveFineGrams,
      d.liabilitiesKsh
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FEDHA_MMF_NAV_History_${range}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Official NAV History
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs text-slate-500">
              {filteredData.length} Daily Strikes
            </span>
          </div>

          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              KSh {activeRecord?.navPerUnit.toFixed(4)}
            </span>
            <span
              className={`text-xs font-bold ${
                periodReturnPct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {periodReturnPct >= 0 ? '+' : ''}
              {periodReturnPct.toFixed(2)}% ({range})
            </span>
            {activeRecord && (
              <span className="text-xs text-slate-400 font-mono">
                {activeRecord.date}
              </span>
            )}
          </div>
        </div>

        {/* View Mode & Range Switchers */}
        <div className="flex items-center gap-2">
          {/* Segmented Range Buttons */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
            {(['1M', '3M', '6M', '1Y', 'ALL'] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 font-semibold rounded-md transition ${
                  range === r
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Line vs Breakdown toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'line' ? 'breakdown' : 'line')}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1"
            title="Toggle Return Attribution Breakdown"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{viewMode === 'line' ? 'Attribution' : 'NAV Line'}</span>
          </button>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Download CSV historical data"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main SVG Visualization */}
      {viewMode === 'line' ? (
        <div className="relative w-full h-[260px] select-none">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id="navGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#2B3440" stop-opacity="0.25" />
                <stop offset="100%" stop-color="#2B3440" stop-opacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const val = minNav + ratio * (maxNav - minNav);
              const y = padding.top + (height - padding.top - padding.bottom) * (1 - ratio);
              return (
                <g key={ratio}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-100 dark:text-slate-800/80"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="fill-slate-400 text-[10px] font-mono"
                  >
                    KSh {val.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {/* Area fill */}
            {points && (
              <polygon
                points={`${padding.left},${height - padding.bottom} ${points} ${
                  width - padding.right
                },${height - padding.bottom}`}
                fill="url(#navGradient)"
              />
            )}

            {/* NAV line */}
            {points && (
              <polyline
                fill="none"
                stroke="#2B3440"
                className="dark:stroke-slate-300"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            )}

            {/* Hover Vertical Line & Scrubber */}
            {hoverIndex !== null && filteredData[hoverIndex] && (
              <g>
                {(() => {
                  const chartW = width - padding.left - padding.right;
                  const chartH = height - padding.top - padding.bottom;
                  const x = padding.left + (hoverIndex / Math.max(1, filteredData.length - 1)) * chartW;
                  const y =
                    padding.top +
                    chartH -
                    ((filteredData[hoverIndex].navPerUnit - minNav) / (maxNav - minNav)) * chartH;
                  return (
                    <>
                      <line
                        x1={x}
                        y1={padding.top}
                        x2={x}
                        y2={height - padding.bottom}
                        stroke="#94A3B8"
                        strokeDasharray="2 2"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r="5"
                        fill="#2B3440"
                        className="dark:fill-white"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                    </>
                  );
                })()}
              </g>
            )}

            {/* Invisible hover slice overlays for precise scrubbing */}
            {filteredData.map((_, i) => {
              const chartW = width - padding.left - padding.right;
              const sliceW = chartW / filteredData.length;
              const x = padding.left + i * sliceW - sliceW / 2;
              return (
                <rect
                  key={i}
                  x={x}
                  y={padding.top}
                  width={sliceW}
                  height={height - padding.top - padding.bottom}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoverIndex(i)}
                />
              );
            })}
          </svg>
        </div>
      ) : (
        /* Return Attribution Breakdown View */
        <div className="py-2">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Daily NAV Return Engine Components
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Shows how the NAV moves: 90% driven by global LBMA physical silver spot, buffered by CBK treasury bill yield, minus the 0.50% annual fund management fee.
            </p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Physical Silver Movement (90% target)
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white font-semibold">
                    {activeRecord?.returnBreakdown.silverContributionPct > 0 ? '+' : ''}
                    {activeRecord?.returnBreakdown.silverContributionPct.toFixed(3)}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full bg-slate-700 dark:bg-slate-300 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Cash Sleeve Income Accrual (~11.6% yield on 10%)
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    +{activeRecord?.returnBreakdown.incomeContributionPct.toFixed(4)}% daily
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Daily Management Fee Drag (0.50% p.a.)
                  </span>
                  <span className="font-mono text-rose-500 font-semibold">
                    -{activeRecord?.returnBreakdown.feeDragPct.toFixed(4)}% daily
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full bg-rose-400 rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Notes */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
        <span>Strike time: 17:00 EAT (Nairobi) · 15-min TWAP</span>
        <span className="text-amber-600 dark:text-amber-400 font-medium">
          Honest disclosure: Silver prices fluctuate. NAV can fall as well as rise.
        </span>
      </div>
    </div>
  );
};
