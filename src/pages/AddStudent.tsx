import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft } from 'lucide-react';

export default function AddStudent() {
  const navigate = useNavigate();
  const { addStudent } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    mobile: '',
    totalFee: '',
    monthlyFee: '',
    admissionDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addStudent({
        id: uuidv4(),
        name: formData.name,
        fatherName: formData.fatherName,
        mobile: formData.mobile,
        totalFee: Number(formData.totalFee),
        monthlyFee: Number(formData.monthlyFee) || 0,
        paidFee: 0,
        remainingFee: Number(formData.totalFee),
        admissionDate: formData.admissionDate,
        lastFeeAddedMonth: formData.admissionDate.substring(0, 7),
        notes: formData.notes,
      });
      navigate('/students');
    } catch (error) {
      console.error(error);
      alert('Error adding student. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-200">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">Add New Student</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Student Name *</label>
          <input
            required
            type="text"
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4DA3FF] focus:border-[#4DA3FF] outline-none transition-shadow"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Father's Name *</label>
          <input
            required
            type="text"
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4DA3FF] focus:border-[#4DA3FF] outline-none transition-shadow"
            value={formData.fatherName}
            onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number *</label>
          <input
            required
            type="tel"
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4DA3FF] focus:border-[#4DA3FF] outline-none transition-shadow"
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Total Fee (₹) *</label>
          <input
            required
            type="number"
            min="0"
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4DA3FF] focus:border-[#4DA3FF] outline-none transition-shadow"
            value={formData.totalFee}
            onChange={(e) => setFormData({ ...formData, totalFee: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Fee (₹)</label>
          <input
            type="number"
            min="0"
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4DA3FF] focus:border-[#4DA3FF] outline-none transition-shadow"
            value={formData.monthlyFee}
            onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Admission Date *</label>
          <input
            required
            type="date"
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4DA3FF] focus:border-[#4DA3FF] outline-none transition-shadow"
            value={formData.admissionDate}
            onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4DA3FF] focus:border-[#4DA3FF] outline-none transition-shadow min-h-[100px]"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-[#0B1F3A] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#0f2a4a] active:scale-[0.98] transition-all shadow-md"
          >
            Save Student
          </button>
        </div>
      </form>
    </div>
  );
}
