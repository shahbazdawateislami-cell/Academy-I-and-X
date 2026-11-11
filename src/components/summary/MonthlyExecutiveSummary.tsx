import React, { useState } from 'react';
import { MonthMetrics, Transaction } from '../../types/finance';
import { formatCurrency, formatPercentage } from '../../utils/financeAnalytics';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Download,
  Copy,
  Check,
  Users,
  Calendar,
  Utensils,
} from 'lucide-react';

interface MonthlyExecutiveSummaryProps {
  metrics: MonthMetrics;
  availableMonths: string[];
  selectedMonth: string;
  onSelectMonth: (monthKey: string) => void;
  transactions: Transaction[];
  currencySymbol?: string;
  totalStudents?: number;
  schoolName?: string;
}

export const MonthlyExecutiveSummary: React.FC<MonthlyExecutiveSummaryProps> = ({
  metrics,
  availableMonths,
  selectedMonth,
  onSelectMonth,
  transactions,
  currencySymbol = 'Rs. ',
  totalStudents = 160,
  schoolName = 'Residential School & Hostel',
}) => {
  const [copied, setCopied] = useState(false);

  const {
    monthKey,
    monthLabel,
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
    totalBudgetLimit,
    budgetUtilization,
    transactionCount,
    costPerStudent,
    groupBreakdown,
    executiveBrief,
  } = metrics;

  const currentMonthIndex = availableMonths.indexOf(selectedMonth);
  const hasNext = currentMonthIndex > 0;
  const hasPrev = currentMonthIndex < availableMonths.length - 1;

  const handleNextMonth = () => {
    if (hasNext) onSelectMonth(availableMonths[currentMonthIndex - 1]);
  };

  const handlePrevMonth = () => {
    if (hasPrev) onSelectMonth(availableMonths[currentMonthIndex + 1]);
  };

  const handleExportCSV = () => {
    const monthTxs = transactions.filter((t) => t.date.startsWith(monthKey));
    if (monthTxs.length === 0) return;

    const headers = [
      'Date',
      'Voucher / Receipt No',
      'Title / Description',
      'Type',
      'Category ID',
      'Student Name',
      'Roll No',
      'Class / Grade',
      'Room No',
      'Amount',
      'Payment Method',
      'Payee / Merchant',
      'Notes',
    ];

    const rows = monthTxs.map((t) => [
      t.date,
      `"${t.voucherNo || ''}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      t.type,
      t.categoryId,
      `"${t.studentName || ''}"`,
      `"${t.studentRollNo || ''}"`,
      `"${t.classGrade || ''}"`,
      `"${t.hostelRoomNo || ''}"`,
      t.amount.toFixed(2),
      t.paymentMethod,
      `"${(t.payeeOrMerchant || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${schoolName.toLowerCase().replace(/\s+/g, '-')}-statement-${monthKey}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    const text = `${schoolName.toUpperCase()} - MONTHLY AUDIT BRIEFING: ${monthLabel}
---------------------------------------------------------------------
Enrolled Residential Students: ${totalStudents} Boarders
Total Fee & Donation Inflow: ${formatCurrency(totalIncome, currencySymbol)}
Total Hostel & Campus Outflow: ${formatCurrency(totalExpenses, currencySymbol)}
Net Monthly Surplus: ${formatCurrency(netSavings, currencySymbol)} (Reserve Buffer: ${formatPercentage(savingsRate)})
Average Cost Per Student: ${formatCurrency(costPerStudent, currencySymbol)} / month

DEPARTMENTAL EXPENDITURE BREAKDOWN:
${groupBreakdown.map((g) => `- ${g.group}: ${formatCurrency(g.amount, currencySymbol)} (${formatPercentage(g.percentageOfTotal)})`).join('\n')}

CORE HIGHLIGHTS:
${executiveBrief.highlights.map((h) => `• ${h}`).join('\n')}

ALERTS & DEFICITS:
${executiveBrief.riskAlerts.length > 0 ? executiveBrief.riskAlerts.map((a) => `! ${a}`).join('\n') : '• All accounts within sanctioned budget ceilings.'}
`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getAdherenceBadge = () => {
    switch (executiveBrief.adherenceRating) {
      case 'Excellent':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md">
            <ShieldCheck className="w-4 h-4" /> Surplus Reserve (Balanced)
          </span>
        );
      case 'Good':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2.5 py-1 rounded-md">
            <ShieldCheck className="w-4 h-4" /> On Track
          </span>
        );
      case 'Caution':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md">
            <AlertTriangle className="w-4 h-4" /> High Mess / Utility Run
          </span>
        );
      case 'Over Budget':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-md">
            <AlertTriangle className="w-4 h-4" /> Over Sanctioned Budget
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Top Controller Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Month Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={handlePrevMonth}
              disabled={!hasPrev}
              title="Previous Month"
              className="p-1.5 rounded text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-3 py-1 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white min-w-[150px] justify-center select-none font-mono">
              <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>{monthLabel}</span>
            </div>

            <button
              onClick={handleNextMonth}
              disabled={!hasNext}
              title="Next Month"
              className="p-1.5 rounded text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>{transactionCount} vouchers</span>
            <span aria-hidden="true">·</span>
            <span>{totalStudents} Boarders</span>
          </div>
        </div>

        {/* Right Actions: Export / Copy */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopySummary}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy School Brief'}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Statement</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip (5 Grid Elements) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Fee & Inflows */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Total Fee & Inflows</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums truncate">
            {formatCurrency(totalIncome, currencySymbol)}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Hostel, Tuition & Grants
          </div>
        </div>

        {/* Total Operational Outflow */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Operating Outflow</span>
            <TrendingDown className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums truncate">
            {formatCurrency(totalExpenses, currencySymbol)}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Mess, Salaries & Campus Bills
          </div>
        </div>

        {/* Net Monthly Surplus */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Surplus / Balance</span>
            <span className="text-[11px] font-mono text-sky-600 dark:text-sky-400 font-semibold">
              {formatPercentage(savingsRate)} Buffer
            </span>
          </div>
          <div className={`text-xl font-bold font-mono tabular-nums truncate ${
            netSavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {formatCurrency(netSavings, currencySymbol)}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Reserve fund retained
          </div>
        </div>

        {/* Cost Per Residential Student (Critical Domain Metric) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Cost / Student / Mo</span>
            <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-xl font-bold text-sky-600 dark:text-sky-400 font-mono tabular-nums truncate">
            {formatCurrency(costPerStudent, currencySymbol)}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Based on {totalStudents} boarders
          </div>
        </div>

        {/* Budget Adherence */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Health & Status</span>
            {getAdherenceBadge()}
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums truncate">
            {formatCurrency(totalBudgetLimit - totalExpenses, currencySymbol)}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Sanctioned budget headroom
          </div>
        </div>
      </div>

      {/* Automated Executive Intelligence Briefing Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Residential School Executive Financial Briefing</span>
              <span className="text-xs font-normal text-slate-400 font-mono">
                · {schoolName}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Automated audit evaluating mess food costs, teacher salaries, per-student averages, and hostel facilities.
            </p>
          </div>
          <div className="shrink-0">{getAdherenceBadge()}</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          {/* Highlights & Alerts narrative */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div>
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Operational Takeaways & Strengths
              </h4>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {executiveBrief.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {executiveBrief.riskAlerts.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-rose-500 dark:text-rose-400 uppercase tracking-wider mb-2">
                  Budget Accelerations & Audit Alerts
                </h4>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {executiveBrief.riskAlerts.map((alert, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-rose-700 dark:text-rose-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span>{alert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Departmental Allocation Distribution */}
          <div className="lg:col-span-5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  Departmental Cost Breakdown
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Active Outflow</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                Relative distribution of school funds across core hostel, academic, and mess departments.
              </p>

              <div className="space-y-3">
                {groupBreakdown.map((group) => {
                  return (
                    <div key={group.group}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[180px]">
                          {group.group}
                        </span>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-slate-900 dark:text-white font-semibold tabular-nums">
                            {formatCurrency(group.amount, currencySymbol)}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            ({formatPercentage(group.percentageOfTotal)})
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            group.group === 'Mess & Food'
                              ? 'bg-orange-500'
                              : group.group === 'Faculty & Staff'
                              ? 'bg-sky-500'
                              : group.group === 'Hostel & Campus Facilities'
                              ? 'bg-amber-500'
                              : group.group === 'Student Welfare & Healthcare'
                              ? 'bg-pink-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, group.percentageOfTotal)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
              Mess & Kitchen typically represents 25%–35% of a healthy residential school budget.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
