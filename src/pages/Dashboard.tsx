import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { PlusCircle, MinusCircle, Wallet, TrendingUp, TrendingDown, Users, Receipt, Database, Cloud } from 'lucide-react';
import { isToday } from 'date-fns';

export default function Dashboard() {
  const { data } = useStore();

  const totalIncome = data.transactions
    .filter((t) => t.type === 'INCOME' || t.type === 'FEE')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = data.transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  const feesReceived = data.transactions
    .filter((t) => t.type === 'FEE')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalStudentFeeDue = data.students
    .filter((s) => s.status !== 'inactive')
    .reduce((sum, s) => sum + s.remainingFee, 0);

  const todaysIncome = data.transactions
    .filter((t) => (t.type === 'INCOME' || t.type === 'FEE') && isToday(new Date(t.date)))
    .reduce((sum, t) => sum + t.amount, 0);

  const todaysExpense = data.transactions
    .filter((t) => t.type === 'EXPENSE' && isToday(new Date(t.date)))
    .reduce((sum, t) => sum + t.amount, 0);

  const recentTransactions = data.transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Approximate storage usage calculation (rough estimate of JSON size in bytes)
  const approxBytes = JSON.stringify(data).length;
  const storageUsedKB = (approxBytes / 1024).toFixed(1);
  const storageLimitKB = 1048576; // 1GB in KB
  const storagePercent = (approxBytes / (storageLimitKB * 1024)) * 100;
  const displayPercent = storagePercent < 0.01 ? '<0.01' : storagePercent.toFixed(2);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Link
          to="/add-income"
          className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 text-emerald-700 shadow-sm hover:shadow-md transition-shadow active:scale-95"
        >
          <PlusCircle className="w-8 h-8" />
          <span className="font-semibold">Add Income</span>
        </Link>
        <Link
          to="/add-expense"
          className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 text-rose-700 shadow-sm hover:shadow-md transition-shadow active:scale-95"
        >
          <MinusCircle className="w-8 h-8" />
          <span className="font-semibold">Add Expense</span>
        </Link>
      </div>

      <div className="bg-[#0B1F3A] text-white rounded-3xl p-6 shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
        <p className="text-slate-300 text-sm font-medium mb-1">Current Balance</p>
        <h2 className="text-4xl font-bold tracking-tight">{formatCurrency(currentBalance)}</h2>
        
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
          <div>
            <div className="flex items-center text-emerald-400 mb-1">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium">Total Income</span>
            </div>
            <p className="text-lg font-semibold">{formatCurrency(totalIncome)}</p>
          </div>
          <div>
            <div className="flex items-center text-rose-400 mb-1">
              <TrendingDown className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium">Total Expense</span>
            </div>
            <p className="text-lg font-semibold">{formatCurrency(totalExpense)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center text-slate-500 mb-2">
            <Receipt className="w-4 h-4 mr-2" />
            <span className="text-xs font-medium uppercase tracking-wider">Fees Received</span>
          </div>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(feesReceived)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center text-slate-500 mb-2">
            <Users className="w-4 h-4 mr-2" />
            <span className="text-xs font-medium uppercase tracking-wider">Total Due</span>
          </div>
          <p className="text-xl font-bold text-amber-600">{formatCurrency(totalStudentFeeDue)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Today's Income</p>
          <p className="text-lg font-bold text-emerald-600">{formatCurrency(todaysIncome)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Today's Expense</p>
          <p className="text-lg font-bold text-rose-600">{formatCurrency(todaysExpense)}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800">Recent Transactions</h3>
          <Link to="/history" className="text-sm text-[#4DA3FF] font-medium">View All</Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {recentTransactions.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentTransactions.map((t) => (
                <div key={t.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      t.type === 'EXPENSE' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {t.type === 'EXPENSE' ? <MinusCircle className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{t.category}</p>
                      <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className={`font-bold ${
                    t.type === 'EXPENSE' ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    {t.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(t.amount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              No transactions yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
