import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { ArrowLeft } from 'lucide-react';

export default function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, updateStudent, loading, deleteStudent } = useStore();
  
  const student = data.students.find(s => s.id === id);

  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    mobile: '',
    totalFee: '',
    monthlyFee: '',
    admissionDate: '',
    notes: '',
    status: 'active',
  });
  
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        fatherName: student.fatherName,
        mobile: student.mobile,
        totalFee: student.totalFee.toString(),
        monthlyFee: student.monthlyFee?.toString() || '',
        admissionDate: student.admissionDate,
        notes: student.notes || '',
        status: student.status || 'active',
      });
    } else if (!loading) {
      navigate('/students');
    }
  }, [student, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (student) {
      try {
        const oldTotalFee = student.totalFee;
        const newTotalFee = Number(formData.totalFee);
        const feeDifference = newTotalFee - oldTotalFee;

        await updateStudent({
          ...student,
          name: formData.name,
          fatherName: formData.fatherName,
          mobile: formData.mobile,
          totalFee: newTotalFee,
          monthlyFee: Number(formData.monthlyFee) || 0,
          // Update remaining fee based on the difference
          remainingFee: (student.remainingFee || 0) + feeDifference,
          admissionDate: formData.admissionDate,
          notes: formData.notes,
          status: formData.status as 'active' | 'inactive',
        });
        navigate(`/student/${id}`);
      } catch (error) {
        console.error(error);
        alert('Error updating student. Please try again.');
      }
    }
  };

  if (!student) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-200">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">Edit Student</h2>
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
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4DA3FF] focus:border-[#4DA3FF] outline-none transition-shadow"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="active">Active (Studying)</option>
            <option value="inactive">Inactive (Left Academy)</option>
          </select>
          <p className="text-xs text-slate-500 mt-1">If a student has left the academy, mark them as Inactive to remove their dues from the total amount.</p>
        </div>
        <div className="pt-4 space-y-3">
          <button
            type="submit"
            className="w-full bg-[#0B1F3A] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#0f2a4a] active:scale-[0.98] transition-all shadow-md"
          >
            Update Student
          </button>
          
          {isDeleting ? (
            <div className="w-full bg-rose-50 p-4 rounded-xl border border-rose-100 space-y-3">
              <p className="text-sm text-rose-800 text-center font-medium">Are you sure? All their data will be removed.</p>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={async () => {
                    await deleteStudent(student.id);
                    navigate('/students');
                  }}
                  className="flex-1 bg-rose-600 text-white py-3 rounded-xl font-bold hover:bg-rose-700 transition-colors"
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleting(false)}
                  className="flex-1 bg-slate-200 text-slate-800 py-3 rounded-xl font-bold hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsDeleting(true)}
              className="w-full bg-rose-50 text-rose-600 py-3 rounded-xl font-bold hover:bg-rose-100 transition-colors"
            >
              Delete Student
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
