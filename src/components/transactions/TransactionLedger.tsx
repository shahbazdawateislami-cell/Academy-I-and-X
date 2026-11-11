import React, { useState, useMemo } from 'react';
import { Category, Transaction, TransactionType } from '../../types/finance';
import { formatCurrency, formatMonthLabel, getMonthKey } from '../../utils/financeAnalytics';
import {
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Calendar,
  Repeat,
  Tag,
  Plus,
  User,
  FileText,
} from 'lucide-react';

interface TransactionLedgerProps {
  transactions: Transaction[];
  categories: Category[];
  selectedMonth: string;
  onDeleteTransaction: (id: string) => void;
  onOpenAddModal: () => void;
  filterCategory?: string | null;
  onClearCategoryFilter?: () => void;
  currencySymbol?: string;
  onViewReceipt?: (tx: Transaction) => void;
}

type SortField = 'date' | 'amount' | 'title';
type SortOrder = 'asc' | 'desc';

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({
  transactions,
  categories,
  selectedMonth,
  onDeleteTransaction,
  onOpenAddModal,
  filterCategory,
  onClearCategoryFilter,
  currencySymbol = 'Rs. ',
  onViewReceipt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>(filterCategory || 'all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [monthScope, setMonthScope] = useState<'selected' | 'all'>('selected');

  React.useEffect(() => {
    if (filterCategory) {
      setActiveCategoryFilter(filterCategory);
    }
  }, [filterCategory]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        if (monthScope === 'selected' && getMonthKey(tx.date) !== selectedMonth) {
          return false;
        }

        if (typeFilter !== 'all' && tx.type !== typeFilter) {
          return false;
        }

        if (activeCategoryFilter !== 'all' && tx.categoryId !== activeCategoryFilter) {
          return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = tx.title.toLowerCase().includes(q);
          const matchVoucher = tx.voucherNo?.toLowerCase().includes(q);
          const matchStudent = tx.studentName?.toLowerCase().includes(q);
          const matchRoll = tx.studentRollNo?.toLowerCase().includes(q);
          const matchMerchant = tx.payeeOrMerchant?.toLowerCase().includes(q);
          const matchNotes = tx.notes?.toLowerCase().includes(q);
          const matchCat = categoryMap.get(tx.categoryId)?.name.toLowerCase().includes(q);
          if (!matchTitle && !matchVoucher && !matchStudent && !matchRoll && !matchMerchant && !matchNotes && !matchCat) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          return sortOrder === 'desc'
            ? b.date.localeCompare(a.date)
            : a.date.localeCompare(b.date);
        }
        if (sortField === 'amount') {
          return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
        }
        if (sortField === 'title') {
          return sortOrder === 'desc'
            ? b.title.localeCompare(a.title)
            : a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [transactions, monthScope, selectedMonth, typeFilter, activeCategoryFilter, searchQuery, sortField, sortOrder, categoryMap]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const totalFilteredAmount = filteredTransactions.reduce((acc, tx) => {
    return tx.type === 'income' ? acc + tx.amount : acc - tx.amount;
  }, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden transition-colors">
      {/* Top Filter and Search Strip */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Residential School Accounts & Voucher Register</span>
              <span className="text-xs font-mono font-normal text-slate-400">
                · {filteredTransactions.length} vouchers
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Audited vouchers covering student fees, mess food invoices, staff salaries, and campus upkeep.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddModal}
              className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Voucher</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student, roll no, voucher #, vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Month Scope Toggle */}
          <div className="sm:col-span-3 flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setMonthScope('selected')}
              className={`flex-1 py-1 px-2 rounded-md font-medium transition-colors ${
                monthScope === 'selected'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setMonthScope('all')}
              className={`flex-1 py-1 px-2 rounded-md font-medium transition-colors ${
                monthScope === 'all'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              All Terms
            </button>
          </div>

          {/* Type Filter Buttons */}
          <div className="sm:col-span-4 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`flex-1 py-1 px-2 rounded-md font-medium transition-colors ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              All Entries
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`flex-1 py-1 px-2 rounded-md font-medium transition-colors ${
                typeFilter === 'income'
                  ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-400'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Fees & Inflow
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`flex-1 py-1 px-2 rounded-md font-medium transition-colors ${
                typeFilter === 'expense'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Hostel Outflow
            </button>
          </div>
        </div>

        {/* Category Active Indicator */}
        {activeCategoryFilter !== 'all' && (
          <div className="flex items-center gap-2 pt-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Filtered Department:</span>
            <span className="font-medium text-slate-900 dark:text-white">
              {categoryMap.get(activeCategoryFilter)?.name || activeCategoryFilter}
            </span>
            <button
              onClick={() => {
                setActiveCategoryFilter('all');
                onClearCategoryFilter?.();
              }}
              className="text-sky-600 dark:text-sky-400 hover:underline text-[11px]"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 select-none">
              <th
                onClick={() => toggleSort('date')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-semibold">Voucher / ID</th>
              <th
                onClick={() => toggleSort('title')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Description / Student / Vendor</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-semibold">Account Category</th>
              <th className="py-2.5 px-3 font-semibold">Payment Mode</th>
              <th
                onClick={() => toggleSort('amount')}
                className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Amount ({currencySymbol})</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-semibold text-center w-36">Receiving & Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                  No school transaction vouchers matched the current filter.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const cat = categoryMap.get(tx.categoryId);
                const isIncome = tx.type === 'income';

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group h-10"
                  >
                    {/* Date */}
                    <td className="py-2 px-3 whitespace-nowrap font-mono text-slate-500 dark:text-slate-400">
                      {tx.date}
                    </td>

                    {/* Voucher No */}
                    <td className="py-2 px-3 whitespace-nowrap font-mono text-slate-600 dark:text-slate-300">
                      {tx.voucherNo || '—'}
                    </td>

                    {/* Title, Student details, Payee */}
                    <td className="py-2 px-3 min-w-[220px]">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {tx.title}
                        </span>
                        {tx.recurring && (
                          <span
                            title="Monthly recurring fee/bill"
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            <Repeat className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      {/* Student info tags or Payee notes */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {tx.studentName && (
                          <span className="text-sky-700 dark:text-sky-400 font-medium">
                            Student: {tx.studentName} {tx.studentRollNo ? `(${tx.studentRollNo})` : ''} {tx.classGrade ? `· ${tx.classGrade}` : ''} {tx.hostelRoomNo ? `· ${tx.hostelRoomNo}` : ''}
                          </span>
                        )}
                        {tx.payeeOrMerchant && (
                          <span>Vendor: {tx.payeeOrMerchant}</span>
                        )}
                        {tx.notes && (
                          <span className="text-slate-800 dark:text-slate-200 bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800 px-1.5 py-0.5 rounded font-medium inline-flex items-center gap-1">
                            <span className="text-sky-700 dark:text-sky-400 font-semibold text-[10px] uppercase">Receiving Note:</span>
                            <span>{tx.notes}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      {cat ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-xs shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-slate-700 dark:text-slate-300">
                            {cat.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">General</span>
                      )}
                    </td>

                    {/* Payment Method */}
                    <td className="py-2 px-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {tx.paymentMethod}
                    </td>

                    {/* Amount */}
                    <td className="py-2 px-3 whitespace-nowrap text-right font-mono tabular-nums font-semibold">
                      <span
                        className={
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-slate-200'
                        }
                      >
                        {isIncome ? '+' : '-'} {formatCurrency(tx.amount, currencySymbol)}
                      </span>
                    </td>

                    {/* Receiving Slip & Actions */}
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onViewReceipt?.(tx)}
                          title="View & Print Official Receiving Slip"
                          className="px-2 py-1 text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 dark:text-sky-300 dark:bg-sky-950/60 dark:hover:bg-sky-900 rounded border border-sky-200 dark:border-sky-800 flex items-center gap-1 transition-colors"
                        >
                          <FileText className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                          <span>Receiving</span>
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          title="Delete voucher record"
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Ledger Footer Status */}
      <div className="flex items-center justify-between p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-xs text-slate-500 dark:text-slate-400">
        <div>
          Showing {filteredTransactions.length} of {transactions.length} school records
        </div>
        <div className="flex items-center gap-2 font-mono">
          <span>Net Cash Surplus / Balance:</span>
          <span
            className={`font-semibold tabular-nums ${
              totalFilteredAmount >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(totalFilteredAmount, currencySymbol)}
          </span>
        </div>
      </div>
    </div>
  );
};
