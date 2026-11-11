import React, { useState } from 'react';
import { Category, PaymentMethod, Transaction, TransactionType } from '../../types/finance';
import { X, Plus, User, FileText, Hash } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  defaultMonthKey: string;
  currencySymbol?: string;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddTransaction,
  defaultMonthKey,
  currencySymbol = 'Rs. ',
}) => {
  const [type, setType] = useState<TransactionType>('income');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    return today.startsWith(defaultMonthKey) ? today : `${defaultMonthKey}-10`;
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [recurring, setRecurring] = useState(false);
  const [voucherNo, setVoucherNo] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentRollNo, setStudentRollNo] = useState('');
  const [classGrade, setClassGrade] = useState('');
  const [hostelRoomNo, setHostelRoomNo] = useState('');
  const [payeeOrMerchant, setPayeeOrMerchant] = useState('');
  const [notes, setNotes] = useState('');

  const filteredCategories = categories.filter((c) => c.type === type);

  React.useEffect(() => {
    if (filteredCategories.length > 0 && (!categoryId || !filteredCategories.some((c) => c.id === categoryId))) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [type, filteredCategories, categoryId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddTransaction({
      title: title.trim(),
      amount: parsedAmount,
      type,
      categoryId: categoryId || filteredCategories[0]?.id || 'cat_hostel_fee',
      date,
      paymentMethod,
      recurring,
      voucherNo: voucherNo.trim() || undefined,
      studentName: studentName.trim() || undefined,
      studentRollNo: studentRollNo.trim() || undefined,
      classGrade: classGrade.trim() || undefined,
      hostelRoomNo: hostelRoomNo.trim() || undefined,
      payeeOrMerchant: payeeOrMerchant.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
    // Reset form
    setTitle('');
    setAmount('');
    setVoucherNo('');
    setStudentName('');
    setStudentRollNo('');
    setClassGrade('');
    setHostelRoomNo('');
    setPayeeOrMerchant('');
    setNotes('');
  };

  const applyPreset = (presetTitle: string, presetAmount: number, presetType: TransactionType, presetCat: string) => {
    setTitle(presetTitle);
    setAmount(presetAmount.toString());
    setType(presetType);
    setCategoryId(presetCat);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Record School & Hostel Voucher
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enter student fee receipts, kitchen mess rations, staff salaries, or utility vouchers.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Inflow vs Outflow Type Switch */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 text-xs font-semibold rounded-md transition-all ${
                type === 'income'
                  ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-700'
              }`}
            >
              Fee & Inflow (Receipt)
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 text-xs font-semibold rounded-md transition-all ${
                type === 'expense'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Hostel / Campus Expense (Payment)
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="text-[11px] shrink-0 font-medium">Quick Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset('Student Hostel & Boarding Fee', 15000, 'income', 'cat_hostel_fee')}
              className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
            >
              {currencySymbol}15,000 Hostel Fee
            </button>
            <button
              type="button"
              onClick={() => applyPreset('Kitchen Wholesale Grain & Oil Ration', 65000, 'expense', 'cat_mess_grocery')}
              className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
            >
              {currencySymbol}65,000 Mess Ration
            </button>
            <button
              type="button"
              onClick={() => applyPreset('Hostel Generator Fuel & Electricity', 35000, 'expense', 'cat_electricity_gen')}
              className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
            >
              {currencySymbol}35,000 Generator/Bill
            </button>
          </div>

          {/* Title & Amount Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Voucher Description / Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Hostel Fee Batch - Dorm A / Wheat & Rice Supply"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Amount ({currencySymbol}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="1"
                min="1"
                required
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Category, Voucher No & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Account Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Receipt / Voucher No
              </label>
              <input
                type="text"
                placeholder="e.g. VR-2026-114"
                value={voucherNo}
                onChange={(e) => setVoucherNo(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Student Specific Fields (Shown especially for Fee receipts) */}
          <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              <User className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Student / Boarder Identification (Optional for Fee Entries)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <input
                type="text"
                placeholder="Student Name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Roll No (e.g. RS-140)"
                value={studentRollNo}
                onChange={(e) => setStudentRollNo(e.target.value)}
                className="px-2.5 py-1.5 font-mono rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Class / Grade"
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value)}
                className="px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Dorm / Room No"
                value={hostelRoomNo}
                onChange={(e) => setHostelRoomNo(e.target.value)}
                className="px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Payment Method & Payee/Merchant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              >
                <option value="Cash">Cash (School Office Counter)</option>
                <option value="Bank Transfer">Bank Transfer / Online Portal</option>
                <option value="Online / Mobile Banking">EasyPaisa / JazzCash / Mobile Banking</option>
                <option value="Cheque">Bank Cheque</option>
                <option value="Direct Deposit">Direct Deposit</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Payee / Vendor / Donor
              </label>
              <input
                type="text"
                placeholder="e.g. Wholesale Grain Market, Shifa Medicos, Trustee"
                value={payeeOrMerchant}
                onChange={(e) => setPayeeOrMerchant(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* 7th Form Field: Notes & Receiving Remarks */}
          <div className="space-y-1.5 p-3 rounded-lg border border-sky-200 dark:border-sky-900/60 bg-sky-50/40 dark:bg-sky-950/20">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Receiving Remarks / Tafseel (اس کالم کا اندراج)</span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950/70 px-1.5 py-0.5 rounded">
                  ✓ Receiving Par Lazmi Aayega
                </span>
              </label>
            </div>
            <input
              type="text"
              placeholder="e.g. November Mahine Ki Hostel + Mess Fees / Dawaai Kharcha (Receiving Par Chhapega)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border-2 border-sky-400 dark:border-sky-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium"
            />
            <p className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <span>✓ Is kalam me jo bhi likha jayega wo student/payer ki <strong>Receiving Raseed (Print Slip)</strong> par numaya print hoga.</span>
            </p>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Record School Voucher</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
