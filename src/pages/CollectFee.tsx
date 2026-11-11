import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft } from 'lucide-react';
import { generateReceiptNo, formatCurrency } from '../utils';

export default function CollectFee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, updateStudent, addTransaction, loading } = useStore();
  
  const student = data.students.find(s => s.id === id);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: 'Monthly Fee',
    month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
    paymentMode: 'Cash',
    notes: '',
  });

  const amountNumber = Number(formData.amount) || 0;
  const previouslyPaid = student?.paidFee || 0;
  const totalPaidAfter = previouslyPaid + amountNumber;
  const remainingBalanceAfter = (student?.totalFee || 0) - totalPaidAfter;

  if (loading && !student) {
    return <div className="text-center py-20 text-slate-500">Loading...</div>;
  }

  if (!student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amountNumber <= 0) return;

    try {
      const transactionId = uuidv4();
      const receiptNo = generateReceiptNo();

      // Add Transaction
      await addTransaction({
        id: transactionId,
        type: 'FEE',
        category: formData.category,
        amount: amountNumber,
        date: formData.date,
        paymentMode: formData.paymentMode,
        description: formData.notes,
        studentId: student.id,
        month: formData.category === 'Monthly Fee' ? formData.month : undefined,
        receiptNo,
        previouslyPaid,
        totalPaidAfter,
        remainingBalanceAfter,
      });

      // Update Student
      await updateStudent({
        ...student,
        paidFee: totalPaidAfter,
        remainingFee: remainingBalanceAfter,
      });

      navigate(`/receipt/${transactionId}`);
    } catch (error) {
      console.error(error);
      alert('Error saving fee. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-200">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">Collect Fee</h2>
      </div>

      <div className="bg-[#0B1F3A] text-white p-4 rounded-2xl shadow-md">
        <p className="text-sm text-slate-300">Student</p>
        <p className="text-xl font-bold">{student.name}</p>
        <p className="text-sm">S/O {student.fatherName} • {student.mobile}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input
            required
            type="date"
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4DA3FF] focus:border-[#4DA3FF] outline-none transition-shadow"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Payment For</label>
          <select
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4DA3FF] focus:border-[#4DA3FF] outline-none transition-shadow"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="Monthly Fee">Monthly Fee</option>
            <option value="Admission Fee">Admission Fee</option>
            <option value="Other Fee">Other Fee</option>
          </select>
        </div>

        {formData.category === 'Monthly Fee' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Month</label>
            <input
              type="text"
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4DA3FF] focus:border-[#4DA3FF] outline-none transition-shadow"
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode</label>
          <select
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4DA3FF] focus:border-[#4DA3FF] outline-none transition-shadow"
            value={formData.paymentMode}
            onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
          >
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Payment Amount (₹) *</label>
          <input
            required
            type="number"
            min="1"
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow text-lg font-bold text-emerald-700 bg-emerald-50"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
        </div>

        <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Total Fee:</span>
            <span className="font-semibold">{formatCurrency(student.totalFee)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Previously Paid:</span>
            <span className="font-semibold">{formatCurrency(previouslyPaid)}</span>
          </div>
          <div className="flex justify-between text-emerald-700 font-bold border-t border-slate-200 pt-2 mt-2">
            <span>Total Paid After:</span>
            <span>{formatCurrency(totalPaidAfter)}</span>
          </div>
          <div className="flex justify-between text-rose-600 font-bold">
            <span>Remaining Balance:</span>
            <span>{formatCurrency(remainingBalanceAfter)}</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-semibold text-slate-800">
              Notes / Remarks (Receiving Raseed Par Chhapega)
            </label>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              ✓ Receiving Par Aayega
            </span>
          </div>
          <input
            type="text"
            placeholder="e.g. November Mahine Ki Fee, Hostel, Kitab waghaira (Receiving par chhapegi)"
            className="w-full p-3 border-2 border-emerald-400 bg-emerald-50/20 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow font-medium text-slate-800"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
          <p className="text-xs text-slate-500 mt-1">
            ✓ Is kalam (column) mein aap jo bhi likhenge, woh student ki <strong>Receiving Raseed (PDF / Print Slip)</strong> par lazmi print hoga.
          </p>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-md"
          >
            Save & Generate Receipt
          </button>
        </div>
      </form>
    </div>
  );
}
