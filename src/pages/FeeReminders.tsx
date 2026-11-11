import { useState } from 'react';
import { useStore } from '../store';
import { Search, Filter, MessageCircle } from 'lucide-react';
import { formatCurrency, generateWhatsAppReminderLink } from '../utils';

export default function FeeReminders() {
  const { data } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, DUE, PAID, NOT_PAID_MONTH

  const today = new Date();
  const currentMonthStr = today.toISOString().substring(0, 7);

  const getFilteredStudents = () => {
    let students = data.students.filter((s) => s.status !== 'inactive');

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      students = students.filter(
        (s) =>
          s.name.toLowerCase().includes(lower) ||
          s.fatherName.toLowerCase().includes(lower) ||
          s.mobile.includes(searchTerm)
      );
    }

    if (filter === 'DUE') {
      students = students.filter((s) => s.remainingFee > 0);
    } else if (filter === 'PAID') {
      students = students.filter((s) => s.remainingFee <= 0);
    } else if (filter === 'NOT_PAID_MONTH') {
      // Find students who haven't paid this month
      students = students.filter((s) => {
        const paidThisMonth = data.transactions.some(
          (t) =>
            t.studentId === s.id &&
            (t.type === 'FEE' || t.type === 'INCOME') &&
            t.date.startsWith(currentMonthStr)
        );
        return !paidThisMonth && (s.remainingFee > 0 || (s.monthlyFee || 0) > 0);
      });
    }

    return students;
  };

  const filteredStudents = getFilteredStudents();

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Fee Reminders</h2>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#4DA3FF] focus:border-[#4DA3FF] outline-none transition-shadow"
            placeholder="Search student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['ALL', 'DUE', 'PAID', 'NOT_PAID_MONTH'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                filter === type
                  ? 'bg-[#0B1F3A] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === 'ALL' && 'All Students'}
              {type === 'DUE' && 'Fee Due'}
              {type === 'PAID' && 'Paid'}
              {type === 'NOT_PAID_MONTH' && 'Not Paid This Month'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => {
            const mFee = student.monthlyFee || 0;
            const totalDue = student.remainingFee;
            
            let prevDue = 0;
            let currMonth = 0;
            
            if (totalDue >= mFee) {
              currMonth = mFee;
              prevDue = totalDue - mFee;
            } else {
              currMonth = totalDue;
              prevDue = 0;
            }

            return (
              <div key={student.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{student.name}</h3>
                    <p className="text-sm text-slate-500">S/O {student.fatherName}</p>
                    <p className="text-xs font-medium text-slate-400 mt-1">{student.mobile}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Previous Due</p>
                    <p className="font-bold text-slate-800">{formatCurrency(prevDue)}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Current Month</p>
                    <p className="font-bold text-slate-800">{formatCurrency(currMonth)}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-rose-500 mb-1">Total Due</p>
                    <p className="text-xl font-bold text-rose-600">{formatCurrency(totalDue)}</p>
                  </div>
                  <a
                    href={generateWhatsAppReminderLink(student)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 bg-emerald-500 text-white px-5 py-3 rounded-xl font-bold hover:bg-emerald-600 active:scale-95 transition-all shadow-sm shadow-emerald-200"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>WhatsApp Reminder</span>
                  </a>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-slate-500 bg-white rounded-3xl border border-slate-100 border-dashed">
            No students found in this category.
          </div>
        )}
      </div>
    </div>
  );
}
