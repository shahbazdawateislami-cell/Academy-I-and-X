import React, { useState } from 'react';
import { MonthMetrics } from '../../types/finance';
import { formatCurrency, formatPercentage } from '../../utils/financeAnalytics';
import { Sliders, Check, AlertCircle, Edit2 } from 'lucide-react';

interface BudgetEnvelopeGaugesProps {
  metrics: MonthMetrics;
  budgetLimits: Record<string, number>;
  onUpdateBudgetLimit: (categoryId: string, newLimit: number) => void;
  currencySymbol?: string;
}

export const BudgetEnvelopeGauges: React.FC<BudgetEnvelopeGaugesProps> = ({
  metrics,
  budgetLimits,
  onUpdateBudgetLimit,
  currencySymbol = 'Rs. ',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempLimits, setTempLimits] = useState<Record<string, number>>({});

  const { categoryBreakdown, totalBudgetLimit, totalExpenses, monthLabel } = metrics;

  const handleStartEditing = () => {
    const initial: Record<string, number> = {};
    categoryBreakdown.forEach((item) => {
      initial[item.category.id] = budgetLimits[item.category.id] ?? item.budget;
    });
    setTempLimits(initial);
    setIsEditing(true);
  };

  const handleSave = () => {
    Object.entries(tempLimits).forEach(([catId, limit]) => {
      onUpdateBudgetLimit(catId, limit);
    });
    setIsEditing(false);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800/80 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Departmental & Hostel Budget Allocations
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              · {categoryBreakdown.length} Accounts
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sanctioned limits for Mess, Faculty, Energy & Maintenance with real-time tracking.
          </p>
        </div>

        {/* Action Button */}
        <div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Targets</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartEditing}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Adjust Envelopes</span>
            </button>
          )}
        </div>
      </div>

      {/* Aggregate Header Bar */}
      <div className="py-3 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-500 dark:text-slate-400">Total Sanctioned Budget: </span>
          <span className="font-semibold text-slate-900 dark:text-white font-mono tabular-nums">
            {formatCurrency(totalBudgetLimit, currencySymbol, true)}
          </span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400">Total Disbursed: </span>
          <span className="font-semibold text-slate-900 dark:text-white font-mono tabular-nums">
            {formatCurrency(totalExpenses, currencySymbol)}
          </span>
          <span className="text-slate-400 ml-1.5 font-mono">
            ({formatPercentage(totalBudgetLimit > 0 ? (totalExpenses / totalBudgetLimit) * 100 : 0)} used)
          </span>
        </div>
      </div>

      {/* Envelope Progress Bars */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {categoryBreakdown.map((item) => {
          const budget = isEditing ? (tempLimits[item.category.id] ?? item.budget) : item.budget;
          const ratio = budget > 0 ? (item.spent / budget) * 100 : 0;
          const isOver = budget > 0 && item.spent > budget;
          const isCaution = !isOver && ratio >= 80;

          return (
            <div
              key={item.category.id}
              className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: item.category.color }}
                  />
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                    {item.category.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isOver && (
                    <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                      <AlertCircle className="w-3 h-3" /> Over
                    </span>
                  )}
                  <span className="font-mono text-slate-900 dark:text-white tabular-nums font-semibold">
                    {formatCurrency(item.spent, currencySymbol)}
                  </span>
                  <span className="text-slate-400">/</span>
                  {isEditing ? (
                    <input
                      type="number"
                      step="500"
                      min="0"
                      value={budget}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setTempLimits((prev) => ({
                          ...prev,
                          [item.category.id]: val,
                        }));
                      }}
                      className="w-24 px-1.5 py-0.5 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  ) : (
                    <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                      {formatCurrency(budget, currencySymbol, true)}
                    </span>
                  )}
                </div>
              </div>

              {/* Visual Progress Gauge */}
              <div className="w-full bg-slate-200 dark:bg-slate-700/60 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isOver
                      ? 'bg-rose-500'
                      : isCaution
                      ? 'bg-amber-500'
                      : 'bg-sky-500'
                  }`}
                  style={{ width: `${Math.min(100, ratio)}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                <span>Group: {item.category.group}</span>
                <span className="font-mono">
                  {budget > 0 ? `${Math.round(ratio)}% consumed` : 'No envelope limit'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
