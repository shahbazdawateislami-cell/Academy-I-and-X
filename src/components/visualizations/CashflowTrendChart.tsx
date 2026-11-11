import React, { useState } from 'react';
import { MultiMonthTrendPoint, formatCurrency, formatPercentage } from '../../utils/financeAnalytics';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';

interface CashflowTrendChartProps {
  data: MultiMonthTrendPoint[];
  selectedMonth: string;
  onSelectMonth: (monthKey: string) => void;
  currencySymbol?: string;
}

export const CashflowTrendChart: React.FC<CashflowTrendChartProps> = ({
  data,
  selectedMonth,
  onSelectMonth,
  currencySymbol = 'Rs. ',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'bars' | 'net'>('bars');

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        No transaction history available to generate trend visualization.
      </div>
    );
  }

  // Calculate scaling max
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.income, d.expenses, Math.abs(d.netSavings))),
    1000
  );
  const chartHeight = 220;
  const paddingBottom = 30;
  const paddingTop = 20;
  const usableHeight = chartHeight - paddingTop - paddingBottom;

  const getY = (val: number) => {
    return chartHeight - paddingBottom - (val / maxVal) * usableHeight;
  };

  // Generate Net Savings path
  const points = data.map((d, i) => {
    const x = ((i + 0.5) / data.length) * 100;
    const y = getY(Math.max(0, d.netSavings));
    return { x, y, point: d };
  });

  const pathD = points.reduce((acc, curr, i) => {
    return i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`
    : '';

  const activeData = hoveredIndex !== null ? data[hoveredIndex] : data.find(d => d.monthKey === selectedMonth) || data[data.length - 1];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Automated Cashflow & Margin Trend
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              · {data.length} Month Cycle
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time monthly revenue versus operating expenses with net surplus projection.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg dark:bg-slate-800 shrink-0">
          <button
            onClick={() => setViewMode('bars')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              viewMode === 'bars'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Income vs Expense
          </button>
          <button
            onClick={() => setViewMode('net')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              viewMode === 'net'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Net Surplus Curve
          </button>
        </div>
      </div>

      {/* Metric Quick Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-slate-100 dark:border-slate-800/60">
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Inspecting Month</span>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono">
            {activeData.monthShort} ({activeData.monthKey})
          </p>
        </div>
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Total Inflow</span>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            {formatCurrency(activeData.income, currencySymbol)}
          </p>
        </div>
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Total Outflow</span>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 font-mono tabular-nums">
            {formatCurrency(activeData.expenses, currencySymbol)}
          </p>
        </div>
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Net Surplus / Savings</span>
          <p className="text-sm font-semibold text-sky-600 dark:text-sky-400 font-mono tabular-nums flex items-center gap-1">
            {formatCurrency(activeData.netSavings, currencySymbol)}
            <span className="text-xs font-normal text-slate-400">({formatPercentage(activeData.savingsRate)})</span>
          </p>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative mt-4">
        <svg
          viewBox={`0 0 100 ${chartHeight}`}
          preserveAspectRatio="none"
          className="w-full h-56 overflow-visible"
        >
          {/* Subtle horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const val = maxVal * pct;
            const y = getY(val);
            return (
              <g key={idx}>
                <line
                  x1="0"
                  y1={y}
                  x2="100"
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-slate-100 dark:text-slate-800/80"
                  strokeDasharray="2 2"
                />
              </g>
            );
          })}

          {/* Bar Mode Rendering */}
          {viewMode === 'bars' && (
            data.map((item, i) => {
              const colWidth = 100 / data.length;
              const barWidth = colWidth * 0.28;
              const colCenter = i * colWidth + colWidth / 2;
              const isSelected = item.monthKey === selectedMonth;

              const incomeHeight = Math.max(2, (item.income / maxVal) * usableHeight);
              const incomeY = chartHeight - paddingBottom - incomeHeight;

              const expenseHeight = Math.max(2, (item.expenses / maxVal) * usableHeight);
              const expenseY = chartHeight - paddingBottom - expenseHeight;

              return (
                <g
                  key={item.monthKey}
                  className="cursor-pointer group"
                  onClick={() => onSelectMonth(item.monthKey)}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Background Highlight column */}
                  <rect
                    x={i * colWidth + 1}
                    y={paddingTop}
                    width={colWidth - 2}
                    height={usableHeight}
                    rx="2"
                    className={`transition-colors ${
                      isSelected
                        ? 'fill-sky-50/70 dark:fill-sky-950/20'
                        : 'fill-transparent hover:fill-slate-50 dark:hover:fill-slate-800/30'
                    }`}
                  />

                  {/* Income Bar (Emerald) */}
                  <rect
                    x={colCenter - barWidth - 1}
                    y={incomeY}
                    width={barWidth}
                    height={incomeHeight}
                    rx="1.5"
                    className={`transition-all ${
                      isSelected
                        ? 'fill-emerald-500'
                        : 'fill-emerald-400 group-hover:fill-emerald-500'
                    }`}
                  />

                  {/* Expense Bar (Slate / Sky) */}
                  <rect
                    x={colCenter + 1}
                    y={expenseY}
                    width={barWidth}
                    height={expenseHeight}
                    rx="1.5"
                    className={`transition-all ${
                      isSelected
                        ? 'fill-slate-700 dark:fill-slate-300'
                        : 'fill-slate-400 group-hover:fill-slate-500 dark:fill-slate-600 dark:group-hover:fill-slate-400'
                    }`}
                  />

                  {/* Month Label on X-Axis */}
                  <text
                    x={colCenter}
                    y={chartHeight - 8}
                    textAnchor="middle"
                    className={`text-[3.6px] font-mono select-none ${
                      isSelected
                        ? 'fill-sky-600 font-bold dark:fill-sky-400'
                        : 'fill-slate-500 dark:fill-slate-400'
                    }`}
                  >
                    {item.monthShort}
                  </text>
                </g>
              );
            })
          )}

          {/* Net Savings Curve Mode */}
          {viewMode === 'net' && (
            <>
              {/* Fill Area Gradient */}
              <defs>
                <linearGradient id="netSurplusGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <path d={areaD} fill="url(#netSurplusGrad)" />
              <path
                d={pathD}
                fill="none"
                stroke="#0284c7"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {points.map(({ x, y, point }, idx) => {
                const isSelected = point.monthKey === selectedMonth;
                return (
                  <g
                    key={point.monthKey}
                    className="cursor-pointer"
                    onClick={() => onSelectMonth(point.monthKey)}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 2.5 : 1.8}
                      className={`${
                        isSelected
                          ? 'fill-sky-600 stroke-white dark:stroke-slate-900 stroke-[0.8]'
                          : 'fill-sky-400 hover:fill-sky-600'
                      }`}
                    />
                    <text
                      x={x}
                      y={chartHeight - 8}
                      textAnchor="middle"
                      className={`text-[3.6px] font-mono select-none ${
                        isSelected
                          ? 'fill-sky-600 font-bold dark:fill-sky-400'
                          : 'fill-slate-500 dark:fill-slate-400'
                      }`}
                    >
                      {point.monthShort}
                    </text>
                  </g>
                );
              })}
            </>
          )}
        </svg>
      </div>

      {/* Chart Legend & Help */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span>Income Inflow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-600 dark:bg-slate-300" />
            <span>Operating Outflow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded-xs bg-sky-500" />
            <span>Net Surplus Trend</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-400">
          Click any column to activate monthly executive ledger
        </div>
      </div>
    </div>
  );
};
