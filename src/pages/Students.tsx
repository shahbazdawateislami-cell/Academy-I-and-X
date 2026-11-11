import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Search, UserPlus, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../utils';

export default function Students() {
  const { data } = useStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = data.students
    .filter((student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.mobile.includes(searchTerm)
    )
    .sort((a, b) => {
      // Put inactive students at the bottom
      if (a.status === 'inactive' && b.status !== 'inactive') return 1;
      if (a.status !== 'inactive' && b.status === 'inactive') return -1;
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Students</h2>
        <div className="flex space-x-2">
          <Link
            to="/fee-reminders"
            className="bg-[#4DA3FF] text-white px-3 py-2 rounded-xl text-sm font-medium flex items-center shadow-sm"
          >
            Reminders
          </Link>
          <Link
            to="/add-student"
            className="bg-[#0B1F3A] text-white px-3 py-2 rounded-xl text-sm font-medium flex items-center shadow-sm"
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Add
          </Link>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4DA3FF] focus:border-[#4DA3FF] sm:text-sm shadow-sm transition-shadow"
          placeholder="Search by name or mobile..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <div
              key={student.id}
              onClick={() => navigate(`/student/${student.id}`)}
              className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:border-[#4DA3FF] transition-colors"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-slate-800 text-lg">{student.name}</h3>
                  {student.status === 'inactive' && (
                    <span className="bg-rose-100 text-rose-700 text-[10px] px-2 py-0.5 rounded-full font-bold">INACTIVE</span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mb-2">S/O {student.fatherName}</p>
                <div className="flex space-x-4">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Fee</p>
                    <p className="text-sm font-medium">{formatCurrency(student.totalFee)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Remaining</p>
                    <p className={`text-sm font-bold ${student.remainingFee > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {formatCurrency(student.remainingFee)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-slate-300">
                <ChevronRight className="w-6 h-6" />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-slate-500 bg-white rounded-2xl border border-slate-100 border-dashed">
            No students found.
          </div>
        )}
      </div>
    </div>
  );
}
