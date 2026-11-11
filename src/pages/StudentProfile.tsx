import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { formatCurrency, generateWhatsAppReminderLink } from '../utils';
import { ArrowLeft, Phone, Calendar, IndianRupee, FileText, Edit2, Check, MessageCircle } from 'lucide-react';

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, updateStudent, loading } = useStore();
  
  const [isEditingMonthlyFee, setIsEditingMonthlyFee] = useState(false);
  const [newMonthlyFee, setNewMonthlyFee] = useState('');

  const student = data.students.find((s) => s.id === id);
  const paymentHistory = data.transactions
    .filter((t) => t.type === 'FEE' && t.studentId === id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (loading && !student) {
    return <div className="text-center py-20 text-slate-500">Loading...</div>;
  }

  if (!student) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Student not found.</p>
        <button onClick={() => navigate('/students')} className="mt-4 text-[#4DA3FF] font-medium">Go Back</button>
      </div>
    );
  }

  const handleSaveMonthlyFee = async () => {
    await updateStudent({
      ...student,
      monthlyFee: Number(newMonthlyFee) || 0
    });
    setIsEditingMonthlyFee(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-200">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-800">Student Profile</h2>
            {student.status === 'inactive' && (
              <span className="bg-rose-100 text-rose-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-rose-200">Left</span>
            )}
          </div>
        </div>
        <Link 
          to={`/edit-student/${student.id}`}
          className="flex items-center space-x-1 text-sm font-medium text-[#4DA3FF] hover:text-[#0B1F3A]"
        >
          <Edit2 className="w-4 h-4" />
          <span>Edit</span>
        </Link>
      </div>

      <div className="bg-[#0B1F3A] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#4DA3FF] opacity-20 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <h3 className="text-3xl font-bold mb-1">{student.name}</h3>
        <p className="text-slate-300 text-sm mb-6">S/O {student.fatherName}</p>
        
        <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm border-t border-white/10 pt-4">
          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-2 text-[#4DA3FF]" />
            <span>{student.mobile}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-[#4DA3FF]" />
            <span>{new Date(student.admissionDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs text-slate-500 uppercase font-semibold">Monthly Fee</p>
            {isEditingMonthlyFee ? (
              <button onClick={handleSaveMonthlyFee} className="text-emerald-500 p-1 hover:bg-emerald-50 rounded">
                <Check className="w-3 h-3" />
              </button>
            ) : (
              <button onClick={() => { setIsEditingMonthlyFee(true); setNewMonthlyFee(student.monthlyFee?.toString() || ''); }} className="text-[#4DA3FF] p-1 hover:bg-blue-50 rounded">
                <Edit2 className="w-3 h-3" />
              </button>
            )}
          </div>
          {isEditingMonthlyFee ? (
            <input 
              type="number" 
              className="w-full text-xl font-bold text-slate-800 border-b border-[#4DA3FF] outline-none" 
              value={newMonthlyFee} 
              onChange={e => setNewMonthlyFee(e.target.value)} 
              autoFocus
            />
          ) : (
            <p className="text-xl font-bold text-slate-800">{formatCurrency(student.monthlyFee || 0)}</p>
          )}
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Total Fee Gen.</p>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(student.totalFee)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Total Paid</p>
          <p className="text-xl font-bold text-emerald-600">{formatCurrency(student.paidFee)}</p>
        </div>
        <div className="col-span-1 bg-rose-50 p-4 rounded-2xl shadow-sm border border-rose-100 flex justify-between items-center">
          <div>
            <p className="text-xs text-rose-600 uppercase font-semibold mb-1">Total Due</p>
            <p className="text-xl font-bold text-rose-700">{formatCurrency(student.remainingFee)}</p>
          </div>
        </div>
      </div>

      {student.notes && (
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-amber-800 text-sm">
          <span className="font-bold flex items-center mb-1"><FileText className="w-4 h-4 mr-1"/> Notes:</span>
          {student.notes}
        </div>
      )}

      {student.status !== 'inactive' && (
        <div className="space-y-3">
          <Link
            to={`/collect-fee/${student.id}`}
            className="block w-full bg-[#0B1F3A] text-white text-center py-4 rounded-xl font-bold text-lg hover:bg-[#0f2a4a] active:scale-[0.98] transition-all shadow-md"
          >
            Receive Payment
          </Link>
          <a
            href={generateWhatsAppReminderLink(student)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 w-full bg-[#25D366] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#20b958] active:scale-[0.98] transition-all shadow-md"
          >
            <MessageCircle className="w-6 h-6" />
            <span>WhatsApp Fee Reminder</span>
          </a>
        </div>
      )}

      <div>
        <h3 className="font-bold text-slate-800 mb-4 flex items-center">
          <IndianRupee className="w-5 h-5 mr-2" />
          Payment History
        </h3>
        <div className="space-y-3">
          {paymentHistory.length > 0 ? (
            paymentHistory.map((payment) => (
              <div key={payment.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-slate-800">{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-slate-500">{new Date(payment.date).toLocaleDateString()}</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-md font-medium">
                    {payment.paymentMode}
                  </span>
                </div>
                <div className="text-sm text-slate-600 flex justify-between items-center">
                  <span>{payment.category} {payment.month ? `- ${payment.month}` : ''}</span>
                  <Link to={`/receipt/${payment.id}`} className="text-[#4DA3FF] font-medium text-xs hover:underline">
                    View Receipt
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-white rounded-2xl border border-slate-100 border-dashed text-slate-500 text-sm">
              No payments received yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
