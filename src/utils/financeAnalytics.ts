import { Category, MonthMetrics, SchoolCategoryGroup, Transaction } from '../types/finance';

export const formatCurrency = (val: number, symbol = 'Rs. ', hideDecimals = true): string => {
  const rounded = hideDecimals ? Math.round(val) : val;
  const numFormatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: hideDecimals ? 0 : 2,
    maximumFractionDigits: hideDecimals ? 0 : 2,
  }).format(rounded);

  return `${symbol}${numFormatted}`;
};

export const formatPercentage = (val: number): string => {
  return `${val.toFixed(1)}%`;
};

export const getMonthKey = (dateStr: string): string => {
  return dateStr.slice(0, 7); // 'YYYY-MM'
};

export const formatMonthLabel = (monthKey: string): string => {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const getAvailableMonths = (transactions: Transaction[]): string[] => {
  const set = new Set<string>();
  transactions.forEach((tx) => set.add(getMonthKey(tx.date)));
  return Array.from(set).sort().reverse();
};

export const calculateMonthMetrics = (
  monthKey: string,
  transactions: Transaction[],
  categories: Category[],
  budgetLimits: Record<string, number> = {},
  totalStudents = 160,
  currencySymbol = 'Rs. '
): MonthMetrics => {
  const monthTxs = transactions.filter((tx) => getMonthKey(tx.date) === monthKey);

  let totalIncome = 0;
  let totalExpenses = 0;
  const categorySpentMap: Record<string, number> = {};

  monthTxs.forEach((tx) => {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else {
      totalExpenses += tx.amount;
      categorySpentMap[tx.categoryId] = (categorySpentMap[tx.categoryId] || 0) + tx.amount;
    }
  });

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, (netSavings / totalIncome) * 100) : 0;

  // Compute category details for expense categories
  const expenseCategories = categories.filter((c) => c.type === 'expense');
  let totalBudgetLimit = 0;

  const categoryBreakdown = expenseCategories.map((cat) => {
    const spent = categorySpentMap[cat.id] || 0;
    const budget = budgetLimits[cat.id] ?? cat.defaultMonthlyBudget ?? 0;
    totalBudgetLimit += budget;
    const percentageOfTotal = totalExpenses > 0 ? (spent / totalExpenses) * 100 : 0;
    const isOverBudget = budget > 0 && spent > budget;

    return {
      category: cat,
      spent,
      budget,
      percentageOfTotal,
      isOverBudget,
    };
  }).sort((a, b) => b.spent - a.spent);

  const budgetUtilization = totalBudgetLimit > 0 ? (totalExpenses / totalBudgetLimit) * 100 : 0;

  // Group breakdown for Residential School
  const groupAmounts: Record<string, number> = {
    'Mess & Food': 0,
    'Faculty & Staff': 0,
    'Hostel & Campus Facilities': 0,
    'Academic & Library': 0,
    'Student Welfare & Healthcare': 0,
  };

  categoryBreakdown.forEach(({ category, spent }) => {
    if (groupAmounts[category.group] !== undefined) {
      groupAmounts[category.group] += spent;
    }
  });

  const groupBreakdown = [
    { group: 'Mess & Food' as SchoolCategoryGroup, amount: groupAmounts['Mess & Food'], percentageOfTotal: totalExpenses > 0 ? (groupAmounts['Mess & Food'] / totalExpenses) * 100 : 0 },
    { group: 'Faculty & Staff' as SchoolCategoryGroup, amount: groupAmounts['Faculty & Staff'], percentageOfTotal: totalExpenses > 0 ? (groupAmounts['Faculty & Staff'] / totalExpenses) * 100 : 0 },
    { group: 'Hostel & Campus Facilities' as SchoolCategoryGroup, amount: groupAmounts['Hostel & Campus Facilities'], percentageOfTotal: totalExpenses > 0 ? (groupAmounts['Hostel & Campus Facilities'] / totalExpenses) * 100 : 0 },
    { group: 'Student Welfare & Healthcare' as SchoolCategoryGroup, amount: groupAmounts['Student Welfare & Healthcare'], percentageOfTotal: totalExpenses > 0 ? (groupAmounts['Student Welfare & Healthcare'] / totalExpenses) * 100 : 0 },
    { group: 'Academic & Library' as SchoolCategoryGroup, amount: groupAmounts['Academic & Library'], percentageOfTotal: totalExpenses > 0 ? (groupAmounts['Academic & Library'] / totalExpenses) * 100 : 0 },
  ];

  const topExpenseCategory = categoryBreakdown.length > 0 && categoryBreakdown[0].spent > 0
    ? { category: categoryBreakdown[0].category, amount: categoryBreakdown[0].spent }
    : undefined;

  // Pacing calculations
  const [year, month] = monthKey.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && (now.getMonth() + 1) === month;
  const daysPassed = isCurrentMonth ? Math.min(now.getDate(), daysInMonth) : daysInMonth;

  const monthProgressRatio = daysPassed / daysInMonth;
  const expectedPacingSpend = totalBudgetLimit * monthProgressRatio;
  const actualPacingSpend = totalExpenses;
  const isAheadOfBudget = actualPacingSpend <= expectedPacingSpend;
  const projectedMonthEndSpend = daysPassed > 0 ? (actualPacingSpend / daysPassed) * daysInMonth : actualPacingSpend;

  // Student specific metrics
  const validStudents = Math.max(1, totalStudents);
  const costPerStudent = totalExpenses / validStudents;
  const incomePerStudent = totalIncome / validStudents;

  // Formulate automated executive brief for residential school
  const highlights: string[] = [];
  const riskAlerts: string[] = [];

  highlights.push(`Operating cost per residential student for ${formatMonthLabel(monthKey)} is ${formatCurrency(costPerStudent, currencySymbol)} across ${validStudents} boarders.`);

  if (netSavings > 0) {
    highlights.push(`Surplus fund balance of ${formatCurrency(netSavings, currencySymbol)} (Savings buffer: ${formatPercentage(savingsRate)}).`);
  } else {
    riskAlerts.push(`Operating deficit of ${formatCurrency(Math.abs(netSavings), currencySymbol)}. Fee collections are trailing monthly expenditures.`);
  }

  // Mess vs Salaries note
  const messTotal = groupAmounts['Mess & Food'] || 0;
  if (messTotal > 0 && totalExpenses > 0) {
    const messPerStudent = messTotal / validStudents;
    highlights.push(`Student Mess & Kitchen expenditure stands at ${formatCurrency(messTotal, currencySymbol)} (${formatCurrency(messPerStudent, currencySymbol)} per student/month).`);
  }

  // Alerts on over-budget categories
  categoryBreakdown.forEach((item) => {
    if (item.isOverBudget) {
      riskAlerts.push(`${item.category.name} has exceeded sanctioned allocation by ${formatCurrency(item.spent - item.budget, currencySymbol)} (${Math.round((item.spent / item.budget) * 100)}% utilized).`);
    } else if (item.budget > 0 && item.spent / item.budget > 0.85 && daysPassed < daysInMonth * 0.75) {
      riskAlerts.push(`${item.category.name} is accelerating at ${Math.round((item.spent / item.budget) * 100)}% of envelope with ${(daysInMonth - daysPassed)} days left in the billing cycle.`);
    }
  });

  let adherenceRating: 'Excellent' | 'Good' | 'Caution' | 'Over Budget' = 'Good';
  if (budgetUtilization > 100) {
    adherenceRating = 'Over Budget';
  } else if (budgetUtilization > 85) {
    adherenceRating = 'Caution';
  } else if (savingsRate >= 15 && budgetUtilization <= 85) {
    adherenceRating = 'Excellent';
  }

  const headline = netSavings >= 0
    ? `${formatMonthLabel(monthKey)} Financial Health: ${adherenceRating} · ${formatCurrency(netSavings, currencySymbol)} Surplus`
    : `${formatMonthLabel(monthKey)} Financial Health: Deficit of ${formatCurrency(Math.abs(netSavings), currencySymbol)}`;

  return {
    monthKey,
    monthLabel: formatMonthLabel(monthKey),
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
    totalBudgetLimit,
    budgetUtilization,
    transactionCount: monthTxs.length,
    costPerStudent,
    incomePerStudent,
    categoryBreakdown,
    groupBreakdown,
    topExpenseCategory,
    pacing: {
      daysPassed,
      daysInMonth,
      expectedPacingSpend,
      actualPacingSpend,
      isAheadOfBudget,
      projectedMonthEndSpend,
    },
    executiveBrief: {
      headline,
      highlights,
      riskAlerts,
      adherenceRating,
    },
  };
};

export interface MultiMonthTrendPoint {
  monthKey: string;
  monthShort: string;
  income: number;
  expenses: number;
  netSavings: number;
  savingsRate: number;
  budgetLimit: number;
  costPerStudent: number;
}

export const getMultiMonthTrend = (
  transactions: Transaction[],
  categories: Category[],
  totalStudents = 160,
  monthsCount = 6
): MultiMonthTrendPoint[] => {
  const allMonths = getAvailableMonths(transactions).slice(0, monthsCount).reverse();
  
  return allMonths.map((mKey) => {
    const metrics = calculateMonthMetrics(mKey, transactions, categories, {}, totalStudents);
    const [year, month] = mKey.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    const monthShort = date.toLocaleDateString('en-US', { month: 'short' });

    return {
      monthKey: mKey,
      monthShort,
      income: metrics.totalIncome,
      expenses: metrics.totalExpenses,
      netSavings: metrics.netSavings,
      savingsRate: metrics.savingsRate,
      budgetLimit: metrics.totalBudgetLimit,
      costPerStudent: metrics.costPerStudent,
    };
  });
};
