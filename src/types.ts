export type TransactionType = 'INCOME' | 'EXPENSE' | 'FEE';

export interface Student {
  id: string;
  name: string;
  fatherName: string;
  mobile: string;
  totalFee: number;
  paidFee: number;
  remainingFee: number;
  admissionDate: string;
  notes?: string;
  monthlyFee?: number;
  lastFeeAddedMonth?: string;
  status?: 'active' | 'inactive';
}

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  description?: string;
  paymentMode: string;
  
  // Specific to FEE
  studentId?: string;
  month?: string;
  receiptNo?: string;
  previouslyPaid?: number;
  totalPaidAfter?: number;
  remainingBalanceAfter?: number;
  
  // Specific to EXPENSE
  paidTo?: string;

  // Specific to DONOR / WITH RECEIPT INCOME
  donorName?: string;
  donorMobile?: string;
  donorAddress?: string;
}

export interface AppData {
  students: Student[];
  transactions: Transaction[];
}
