export type TransactionType = 'income' | 'expense';

export type SchoolCategoryGroup = 
  | 'Mess & Food' 
  | 'Faculty & Staff' 
  | 'Hostel & Campus Facilities' 
  | 'Academic & Library' 
  | 'Student Welfare & Healthcare' 
  | 'Fee Inflows' 
  | 'Donations & Grants';

export type PaymentMethod = 
  | 'Bank Transfer' 
  | 'Cash' 
  | 'Online / Mobile Banking' 
  | 'Cheque' 
  | 'Direct Deposit';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  group: SchoolCategoryGroup;
  color: string;
  icon: string;
  defaultMonthlyBudget?: number;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  recurring?: boolean;
  voucherNo?: string;
  studentName?: string;
  studentRollNo?: string;
  classGrade?: string;
  hostelRoomNo?: string;
  payeeOrMerchant?: string;
  notes?: string;
}

export interface SchoolSettings {
  schoolName: string;
  totalStudents: number;
  currencySymbol: string;
  academicTerm: string;
}

export interface MonthMetrics {
  monthKey: string;
  monthLabel: string;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  totalBudgetLimit: number;
  budgetUtilization: number;
  transactionCount: number;
  costPerStudent: number;
  incomePerStudent: number;
  categoryBreakdown: {
    category: Category;
    spent: number;
    budget: number;
    percentageOfTotal: number;
    isOverBudget: boolean;
  }[];
  groupBreakdown: {
    group: SchoolCategoryGroup;
    amount: number;
    percentageOfTotal: number;
  }[];
  topExpenseCategory?: {
    category: Category;
    amount: number;
  };
  pacing: {
    daysPassed: number;
    daysInMonth: number;
    expectedPacingSpend: number;
    actualPacingSpend: number;
    isAheadOfBudget: boolean;
    projectedMonthEndSpend: number;
  };
  executiveBrief: {
    headline: string;
    highlights: string[];
    riskAlerts: string[];
    adherenceRating: 'Excellent' | 'Good' | 'Caution' | 'Over Budget';
  };
}
