import React, { useState } from 'react';
import { Category, MonthMetrics } from '../../types/finance';
import { formatCurrency, formatPercentage } from '../../utils/financeAnalytics';
import { PieChart, AlertCircle } from 'lucide-react';

interface CategoryDistributionChartProps {
  metrics: MonthMetrics;
  onFilterCategory?: (categoryId: string) => void;
  currencySymbol?: string;
}

export const CategoryDistributionChart: React.FC<CategoryDistributionChartProps> = ({
  metrics,
  onFilterCategory,
  currencySymbol = 'Rs. ',
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const { categoryBreakdown, totalExpenses, monthLabel } = metrics;
  const activeItems = categoryBreakdown.filter((item) => item.spent > 0);

  if (activeItems.length === 0 || totalExpenses === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
          Category Outflow Distribution
        </h3>
        <div className="flex h-64 items-center justify-center text-sm text-slate-400">
          No expenses recorded for {monthLabel}.
        </div>
      </div>
    );
  }

  // Geometry for SVG Donut
  const size = 240;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulativeAngle = 0;
  const arcs = activeItems.map((item) => {
    const fraction = item.spent / totalExpenses;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativeAngle * circumference;
    cumulativeAngle += fraction;

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
      fraction,
    };
  });

  const activeHoveredItem = hoveredCategory
    ? activeItems.find((i) => i.category.id === hoveredCategory)
    : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800/80 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Category Outflow Distribution
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              · {activeItems.length} Active Categories
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated percentage clustering and relative weight of expenditures for {monthLabel}.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* SVG Donut */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-52 h-52 flex items-center justify-center">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="transform -rotate-90 w-full h-full"
            >
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-slate-100 dark:text-slate-800/50"
              />
              {arcs.map((arc) => {
                const isHovered = hoveredCategory === arc.category.id;
                return (
                  <circle
                    key={arc.category.id}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={arc.category.color}
                    strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                    strokeDasharray={arc.strokeDasharray}
                    strokeDashoffset={arc.strokeDashoffset}
                    strokeLinecap="butt"
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredCategory(arc.category.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    onClick={() => onFilterCategory?.(arc.category.id)}
                  />
                );
              })}
            </svg>

            {/* Donut Center Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              {activeHoveredItem ? (
                <>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                    {activeHoveredItem.category.name}
                  </span>
                  <span className="text-base font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                    {formatCurrency(activeHoveredItem.spent, currencySymbol)}
                  </span>
                  <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 font-mono">
                    {formatPercentage(activeHoveredItem.percentageOfTotal)}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                    Total Outflow
                  </span>
                  <span className="text-base font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                    {formatCurrency(totalExpenses, currencySymbol)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {activeItems.length} allocations
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Category Breakdown Table / List */}
        <div className="md:col-span-7 flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
          {activeItems.map((item) => {
            const isHovered = hoveredCategory === item.category.id;
            return (
              <div
                key={item.category.id}
                onMouseEnter={() => setHoveredCategory(item.category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={() => onFilterCategory?.(item.category.id)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                  isHovered
                    ? 'bg-slate-100 dark:bg-slate-800'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: item.category.color }}
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 dark:text-slate-200 truncate">
                      {item.category.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{item.category.group}</span>
                      {item.isOverBudget && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-rose-600 dark:text-rose-400 flex items-center gap-0.5 font-medium">
                            <AlertCircle className="w-3 h-3 inline" /> Over Budget
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <p className="font-semibold text-slate-900 dark:text-white font-mono tabular-nums">
                    {formatCurrency(item.spent, currencySymbol)}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {formatPercentage(item.percentageOfTotal)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
