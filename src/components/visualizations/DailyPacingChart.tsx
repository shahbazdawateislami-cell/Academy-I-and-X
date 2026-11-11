import React from 'react';
import { MonthMetrics, Transaction } from '../../types/finance';
import { formatCurrency, formatPercentage, getMonthKey } from '../../utils/financeAnalytics';
import { Compass, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface DailyPacingChartProps {
  metrics: MonthMetrics;
  transactions: Transaction[];
  currencySymbol?: string;
}

export const DailyPacingChart: React.FC<DailyPacingChartProps> = ({
  metrics,
  transactions,
  currencySymbol = 'Rs. ',
}) => {
  const { monthKey, monthLabel, totalBudgetLimit, totalExpenses, pacing } = metrics;
  const { daysInMonth, daysPassed, isAheadOfBudget, projectedMonthEndSpend } = pacing;

  // Filter expenses for this month
  const monthExpenses = transactions.filter(
    (tx) => tx.type === 'expense' && getMonthKey(tx.date) === monthKey
  );

  // Group by day of month (1..daysInMonth)
  const dailySpend: Record<number, number> = {};
  for (let d = 1; d <= daysInMonth; d++) {
    dailySpend[d] = 0;
  }

  monthExpenses.forEach((tx) => {
    const day = parseInt(tx.date.split('-')[2], 10);
    if (day >= 1 && day <= daysInMonth) {
      dailySpend[day] = (dailySpend[day] || 0) + tx.amount;
    }
  });

  // Calculate cumulative actual spend up to daysPassed
  const cumulativePoints: { day: number; cumulative: number }[] = [];
  let runningTotal = 0;
  for (let d = 1; d <= daysPassed; d++) {
    runningTotal += dailySpend[d];
    cumulativePoints.push({ day: d, cumulative: runningTotal });
  }

  // Geometry
  const chartWidth = 500;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 25;
  const plotWidth = chartWidth - paddingX * 2;
  const plotHeight = chartHeight - paddingY * 2;

  const targetMax = Math.max(totalBudgetLimit, projectedMonthEndSpend, totalExpenses, 1000) * 1.05;

  const getX = (day: number) => paddingX + ((day - 1) / (daysInMonth - 1)) * plotWidth;
  const getY = (val: number) => chartHeight - paddingY - (val / targetMax) * plotHeight;

  // Linear ideal pacing points (day 1 = 0, day daysInMonth = totalBudgetLimit)
  const idealStart = { x: getX(1), y: getY(0) };
  const idealEnd = { x: getX(daysInMonth), y: getY(totalBudgetLimit) };

  // Actual cumulative path
  const actualPathD = cumulativePoints.reduce((acc, pt, idx) => {
    const x = getX(pt.day);
    const y = getY(pt.cumulative);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Pacing status calculation
  const pacingDelta = (totalBudgetLimit * (daysPassed / daysInMonth)) - totalExpenses;
  const deltaAbs = Math.abs(pacingDelta);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800/80 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Daily Spending Velocity & Pacing Trajectory
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              · Day {daysPassed} of {daysInMonth}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time burn rate compared against linear budget pacing to prevent month-end overshoot.
          </p>
        </div>

        {/* Status Callout */}
        <div className="flex items-center gap-2">
          {isAheadOfBudget ? (
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Pacing {formatCurrency(deltaAbs, currencySymbol, true)} below envelope</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-medium text-rose-700 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Over pacing trajectory by {formatCurrency(deltaAbs, currencySymbol, true)}</span>
            </div>
          )}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="mt-4 w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-44 overflow-visible"
        >
          {/* Budget baseline ceiling */}
          <line
            x1={paddingX}
            y1={getY(totalBudgetLimit)}
            x2={chartWidth - paddingX}
            y2={getY(totalBudgetLimit)}
            stroke="#94a3b8"
            strokeWidth="0.8"
            strokeDasharray="4 4"
          />
          <text
            x={chartWidth - paddingX}
            y={getY(totalBudgetLimit) - 4}
            textAnchor="end"
            className="text-[10px] fill-slate-400 dark:fill-slate-500 font-mono"
          >
            Budget Limit: {formatCurrency(totalBudgetLimit, currencySymbol, true)}
          </text>

          {/* Linear Ideal trajectory line */}
          <line
            x1={idealStart.x}
            y1={idealStart.y}
            x2={idealEnd.x}
            y2={idealEnd.y}
            stroke="#cbd5e1"
            className="dark:stroke-slate-700"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          {/* Actual Cumulative Spent path */}
          {actualPathD && (
            <path
              d={actualPathD}
              fill="none"
              stroke={isAheadOfBudget ? '#0284c7' : '#e11d48'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Today's marker */}
          {cumulativePoints.length > 0 && (
            <g>
              <circle
                cx={getX(daysPassed)}
                cy={getY(totalExpenses)}
                r="4.5"
                fill={isAheadOfBudget ? '#0284c7' : '#e11d48'}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <text
                x={getX(daysPassed)}
                y={getY(totalExpenses) - 8}
                textAnchor="middle"
                className="text-[10px] font-bold fill-slate-900 dark:fill-white font-mono"
              >
                {formatCurrency(totalExpenses, currencySymbol, true)}
              </text>
            </g>
          )}

          {/* Forecasted End-of-month projection line */}
          {daysPassed < daysInMonth && (
            <line
              x1={getX(daysPassed)}
              y1={getY(totalExpenses)}
              x2={getX(daysInMonth)}
              y2={getY(projectedMonthEndSpend)}
              stroke={isAheadOfBudget ? '#38bdf8' : '#fb7185'}
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          )}

          {/* X-axis days markings */}
          {[1, Math.round(daysInMonth / 4), Math.round(daysInMonth / 2), Math.round((3 * daysInMonth) / 4), daysInMonth].map(
            (day) => (
              <text
                key={day}
                x={getX(day)}
                y={chartHeight - 6}
                textAnchor="middle"
                className="text-[10px] fill-slate-400 font-mono select-none"
              >
                Day {day}
              </text>
            )
          )}
        </svg>
      </div>

      {/* Trajectory Insights Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div>
          <span className="text-slate-400 block text-[11px]">Actual Spend to Date</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono tabular-nums">
            {formatCurrency(totalExpenses, currencySymbol)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Expected Linear Budget Spend</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono tabular-nums">
            {formatCurrency(totalBudgetLimit * (daysPassed / daysInMonth), currencySymbol)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Forecasted Month-End Close</span>
          <span className={`font-semibold font-mono tabular-nums ${
            projectedMonthEndSpend > totalBudgetLimit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {formatCurrency(projectedMonthEndSpend, currencySymbol, true)} ({projectedMonthEndSpend > totalBudgetLimit ? 'Over Budget' : 'Safe'})
          </span>
        </div>
      </div>
    </div>
  );
};
