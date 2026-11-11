import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { Search, PlusCircle, MinusCircle, FileText, Trash2, Calendar as CalendarIcon, FilterX } from 'lucide-react';
import { formatCurrency } from '../utils';
import { startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek } from 'date-fns';

export default function History() {
  const { data, deleteTransaction, updateStudent } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, INCOME, EXPENSE, FEE
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const setQuickDate = (type: string) => {
    const today = new Date();
    if (type === 'TODAY') {
      const dateString = today.toISOString().split('T')[0];
      setStartDate(dateString);
      setEndDate(dateString);
    } else if (type === 'THIS_WEEK') {
      setStartDate(startOfWeek(today, { weekStartsOn: 1 }).toISOString().split('T')[0]);
      setEndDate(endOfWeek(today, { weekStartsOn: 1 }).toISOString().split('T')[0]);
    } else if (type === 'THIS_MONTH') {
      setStartDate(startOfMonth(today).toISOString().split('T')[0]);
      setEndDate(endOfMonth(today).toISOString().split('T')[0]);
    } else if (type === 'LAST_MONTH') {
      const lastMonth = subMonths(today, 1);
      setStartDate(startOfMonth(lastMonth).toISOString().split('T')[0]);
      setEndDate(endOfMonth(lastMonth).toISOString().split('T')[0]);
    } else if (type === 'CLEAR') {
      setStartDate('');
      setEndDate('');
    }
  };

  // 1. Date Filter First
  let dateFilteredTransactions = data.transactions;
  if (startDate) {
    dateFilteredTransactions = dateFilteredTransactions.filter(t => t.date >= startDate);
  }
  if (endDate) {
    dateFilteredTransactions = dateFilteredTransactions.filter(t => t.date <= endDate);
  }

  // Calculate Summary based on Date Filter
  const periodIncome = dateFilteredTransactions
    .filter(t => t.type === 'INCOME' || t.type === 'FEE')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const periodExpense = dateFilteredTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const periodBalance = periodIncome - periodExpense;

  // 2. Type & Search Filters for the list
  let listTransactions = dateFilteredTransactions;
  
  if (filterType !== 'ALL') {
    listTransactions = listTransactions.filter(t => 
      filterType === 'INCOME' ? (t.type === 'INCOME' || t.type === 'FEE') : t.type === filterType
    );
  }

  if (searchTerm) {
    const lowerSearch = searchTerm.toLowerCase();
    listTransactions = listTransactions.filter(t => 
      t.category.toLowerCase().includes(lowerSearch) ||
      t.description?.toLowerCase().includes(lowerSearch) ||
      (t.studentId && data.students.find(s => s.id === t.studentId)?.name.toLowerCase().includes(lowerSearch))
    );
  }

  // Sort by date desc
  listTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string, type: string, amount: number, studentId?: string) => {
    try {
      if (type === 'FEE' && studentId) {
        const student = data.students.find(s => s.id === studentId);
        if (student) {
          await updateStudent({
            ...student,
            paidFee: (student.paidFee || 0) - amount,
            remainingFee: (student.remainingFee || 0) + amount,
          });
        }
      }
      await deleteTransaction(id);
      setConfirmDeleteId(null);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Error deleting transaction. Please try again.");
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Transaction History</h2>

      {/* Date Range Filter */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="date"
                className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#4DA3FF] focus:border-[#4DA3FF] text-sm outline-none transition-all"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">End Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="date"
                className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#4DA3FF] focus:border-[#4DA3FF] text-sm outline-none transition-all"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setQuickDate('TODAY')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors">Today</button>
          <button onClick={() => setQuickDate('THIS_WEEK')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors">This Week</button>
          <button onClick={() => setQuickDate('THIS_MONTH')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors">This Month</button>
          <button onClick={() => setQuickDate('LAST_MONTH')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors">Last Month</button>
          <button onClick={() => setQuickDate('CLEAR')} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-medium rounded-lg transition-colors flex items-center ml-auto">
            <FilterX className="w-3 h-3 mr-1" /> Clear
          </button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center">
            <PlusCircle className="w-3 h-3 mr-1" /> Total Income
          </p>
          <p className="text-lg font-bold text-emerald-700">{formatCurrency(periodIncome)}</p>
        </div>
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-1 flex items-center">
            <MinusCircle className="w-3 h-3 mr-1" /> Total Expense
          </p>
          <p className="text-lg font-bold text-rose-700">{formatCurrency(periodExpense)}</p>
        </div>
        <div className="col-span-2 bg-[#0B1F3A] p-4 rounded-2xl shadow-md text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full blur-2xl -mr-4 -mt-4"></div>
          <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Balance (Selected Period)</p>
          <p className="text-2xl font-bold">{formatCurrency(periodBalance)}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4DA3FF] focus:border-[#4DA3FF] sm:text-sm shadow-sm transition-shadow"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
          {['ALL', 'INCOME', 'EXPENSE', 'FEE'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                filterType === type 
                  ? 'bg-[#0B1F3A] text-white' 
                  : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {type === 'ALL' ? 'All' : type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {listTransactions.length > 0 ? (
          listTransactions.map((t) => {
            const isExpense = t.type === 'EXPENSE';
            const studentName = t.studentId ? data.students.find(s => s.id === t.studentId)?.name : null;
            return (
              <div key={t.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative group overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isExpense ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {isExpense ? <MinusCircle className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 leading-tight">
                        {t.category}
                        {studentName && <span className="text-slate-500 font-normal"> • {studentName}</span>}
                        {t.donorName && <span className="text-emerald-700 font-normal"> • Donor: {t.donorName}</span>}
                      </p>
                      <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()} • {t.paymentMode}</p>
                    </div>
                  </div>
                  <p className={`font-bold shrink-0 ${isExpense ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {isExpense ? '-' : '+'}{formatCurrency(t.amount)}
                  </p>
                </div>
                
                {t.description && (
                  <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {t.description}
                  </p>
                )}

                <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
                  {t.receiptNo ? (
                    <Link to={`/receipt/${t.id}`} className="text-[#4DA3FF] text-xs font-semibold flex items-center hover:underline bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      <FileText className="w-3.5 h-3.5 mr-1 text-[#0B1F3A]" /> Receipt #{t.receiptNo}
                    </Link>
                  ) : (
                    <div />
                  )}
                  {confirmDeleteId === t.id ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDelete(t.id, t.type, t.amount, t.studentId)}
                        className="text-xs bg-rose-500 text-white px-2 py-1 rounded hover:bg-rose-600 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded hover:bg-slate-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmDeleteId(t.id)}
                      className="text-rose-400 hover:text-rose-600 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-slate-500 bg-white rounded-2xl border border-slate-100 border-dashed">
            No transactions found for the selected criteria.
          </div>
        )}
      </div>
    </div>
  );
}
