import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft } from 'lucide-react';

export default function AddExpense() {
  const navigate = useNavigate();
  const { addTransaction } = useStore();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Food',
    amount: '',
    paidTo: '',
    paymentMode: 'Cash',
    description: '',
  });

  const categories = [
    'Food', 'Rent', 'Electricity', 'Teacher Salary', 
    'Books', 'Stationery', 'Maintenance', 'Transport', 'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(formData.amount) <= 0) return;

    try {
      await addTransaction({
        id: uuidv4(),
        type: 'EXPENSE',
        category: formData.category,
        amount: Number(formData.amount),
        date: formData.date,
        paidTo: formData.paidTo,
        paymentMode: formData.paymentMode,
        description: formData.description,
      });
      
      navigate('/'); // Go back to dashboard
    } catch (error) {
      console.error(error);
      alert('Error adding expense. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-200">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">Add Expense</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
          <input
            required
            type="date"
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-shadow"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
          <select
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-shadow"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹) *</label>
          <input
            required
            type="number"
            min="1"
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-shadow text-lg font-bold text-rose-700 bg-rose-50"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Paid To (Optional)</label>
          <input
            type="text"
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-shadow"
            value={formData.paidTo}
            onChange={(e) => setFormData({ ...formData, paidTo: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode</label>
          <select
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-shadow"
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
          <label className="block text-sm font-medium text-slate-700 mb-1">Description / Note</label>
          <input
            type="text"
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-shadow"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-rose-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-rose-700 active:scale-[0.98] transition-all shadow-md"
          >
            Save Expense
          </button>
        </div>
      </form>
    </div>
  );
}
