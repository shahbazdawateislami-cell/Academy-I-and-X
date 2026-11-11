import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { v4 as uuidv4 } from 'uuid';
import { 
  ArrowLeft, 
  Receipt, 
  FileText, 
  Search, 
  User, 
  Phone, 
  MapPin, 
  History, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { generateReceiptNo, formatCurrency } from '../utils';

export default function AddIncome() {
  const navigate = useNavigate();
  const { data, addTransaction } = useStore();

  // Mode: WITHOUT_RECEIPT (original simple form) or WITH_RECEIPT (detailed donor form with receipt)
  const [receiptMode, setReceiptMode] = useState<'WITHOUT_RECEIPT' | 'WITH_RECEIPT'>('WITHOUT_RECEIPT');

  // Search state for donor lookup by mobile number
  const [searchMobile, setSearchMobile] = useState('');
  const [showHistoryList, setShowHistoryList] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form data for WITHOUT_RECEIPT mode (original)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Donation',
    amount: '',
    paymentMode: 'Cash',
    description: '',
  });

  // Form data for WITH_RECEIPT mode (detailed donor information)
  const [donorFormData, setDonorFormData] = useState({
    donorName: '',
    donorMobile: '',
    donorAddress: '',
    category: 'Donation',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    paymentMode: 'Cash',
    description: '',
  });

  // Find donor past records matching the searchMobile query
  const cleanedSearch = searchMobile.replace(/\D/g, '');
  
  const donorPastTransactions = useMemo(() => {
    if (!cleanedSearch || cleanedSearch.length < 3) return [];
    
    return data.transactions
      .filter((t) => {
        if (!t.donorMobile && !t.donorName) return false;
        const mobClean = (t.donorMobile || '').replace(/\D/g, '');
        return mobClean.includes(cleanedSearch);
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data.transactions, cleanedSearch]);

  // Aggregate donor statistics if matched
  const donorStats = useMemo(() => {
    if (donorPastTransactions.length === 0) return null;
    const totalAmount = donorPastTransactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const latest = donorPastTransactions[0];
    const latestName = latest.donorName || '';
    const latestAddress = latest.donorAddress || '';
    const latestMobile = latest.donorMobile || searchMobile;

    return {
      name: latestName,
      mobile: latestMobile,
      address: latestAddress,
      totalAmount,
      count: donorPastTransactions.length,
      lastDonationDate: latest.date,
    };
  }, [donorPastTransactions, searchMobile]);

  // Handle filling donor info from search match into form
  const handleAutoFillDonor = () => {
    if (!donorStats) return;
    setDonorFormData((prev) => ({
      ...prev,
      donorName: donorStats.name || prev.donorName,
      donorMobile: donorStats.mobile || prev.donorMobile,
      donorAddress: donorStats.address || prev.donorAddress,
    }));
  };

  // Submit for WITHOUT_RECEIPT mode (original behavior)
  const handleWithoutReceiptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.category === 'Student Fee') {
      navigate('/students');
      return;
    }

    if (Number(formData.amount) <= 0) return;

    try {
      setSubmitting(true);
      await addTransaction({
        id: uuidv4(),
        type: 'INCOME',
        category: formData.category,
        amount: Number(formData.amount),
        date: formData.date,
        paymentMode: formData.paymentMode,
        description: formData.description,
      });
      
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Error adding income. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit for WITH_RECEIPT mode (creates donor transaction with official receiptNo and navigates to receipt)
  const handleWithReceiptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorFormData.donorName.trim()) {
      alert('Please enter donor name.');
      return;
    }
    if (!donorFormData.donorMobile.trim()) {
      alert('Please enter donor mobile number.');
      return;
    }
    if (Number(donorFormData.amount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    try {
      setSubmitting(true);
      const newTransactionId = uuidv4();
      const receiptNo = generateReceiptNo();

      await addTransaction({
        id: newTransactionId,
        type: 'INCOME',
        category: donorFormData.category,
        amount: Number(donorFormData.amount),
        date: donorFormData.date,
        paymentMode: donorFormData.paymentMode,
        description: donorFormData.description,
        donorName: donorFormData.donorName.trim(),
        donorMobile: donorFormData.donorMobile.trim(),
        donorAddress: donorFormData.donorAddress.trim(),
        receiptNo: receiptNo,
      });

      // Immediately navigate to official receipt page
      navigate(`/receipt/${newTransactionId}`);
    } catch (error) {
      console.error(error);
      alert('Error generating receipt. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isStudentFee = formData.category === 'Student Fee';

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Top Header with Responsive Selective Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-200">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Add Income</h2>
            <p className="text-xs text-slate-500 font-medium">آمدنی درج کریں</p>
          </div>
        </div>

        {/* Selective Buttons: Without Receipt vs With Receipt */}
        <div className="inline-flex p-1.5 bg-slate-200/90 rounded-2xl shadow-inner self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setReceiptMode('WITHOUT_RECEIPT')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 ${
              receiptMode === 'WITHOUT_RECEIPT'
                ? 'bg-white text-slate-800 shadow-md font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Without Receipt</span>
            <span className="text-[10px] text-slate-400 font-normal hidden md:inline">(بغیر رسید)</span>
          </button>
          <button
            type="button"
            onClick={() => setReceiptMode('WITH_RECEIPT')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 ${
              receiptMode === 'WITH_RECEIPT'
                ? 'bg-[#0B1F3A] text-white shadow-md font-extrabold border border-[#D4AF37]/40'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4 text-[#D4AF37]" />
            <span>With Receipt</span>
            <span className="text-[10px] text-amber-200/90 font-normal hidden md:inline">(رسید کے ساتھ)</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODE 1: WITHOUT RECEIPT (ORIGINAL SIMPLE FORM)           */}
      {/* ========================================================= */}
      {receiptMode === 'WITHOUT_RECEIPT' && (
        <form onSubmit={handleWithoutReceiptSubmit} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-2xl flex items-center space-x-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Simple Entry Mode:</span>
            <span>Record general income quickly without generating an official printable receipt.</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
            <select
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="Student Fee">Student Fee (Select Student)</option>
              <option value="Donation">Donation</option>
              <option value="Other Income">Other Income</option>
            </select>
          </div>

          {!isStudentFee && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                <input
                  required
                  type="date"
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹) *</label>
                <input
                  required
                  type="number"
                  min="1"
                  placeholder="0"
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow text-xl font-bold text-emerald-700 bg-emerald-50/70"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode</label>
                <select
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
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
                  placeholder="e.g. Received from well-wisher"
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-md disabled:opacity-50"
            >
              {isStudentFee ? 'Continue to Students' : submitting ? 'Saving...' : 'Save Income'}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* MODE 2: WITH RECEIPT (DONOR DETAIL & SEARCH FEATURE)     */}
      {/* ========================================================= */}
      {receiptMode === 'WITH_RECEIPT' && (
        <div className="space-y-5">
          {/* Top Search Bar for Donor Mobile Number */}
          <div className="bg-gradient-to-br from-[#0B1F3A] to-[#152e54] text-white p-5 rounded-3xl shadow-lg border-2 border-[#D4AF37]/30">
            <div className="flex items-center space-x-2.5 mb-2">
              <Search className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="font-bold text-base sm:text-lg tracking-wide">
                Donor Search / ڈونر تلاش کریں
              </h3>
            </div>
            <p className="text-xs text-blue-100/80 mb-3.5">
              Mobile number darj karein taake donor ka pichhla sara donation record khul kar aa jaye.
            </p>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4 text-[#4DA3FF]" />
              </div>
              <input
                type="tel"
                value={searchMobile}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchMobile(val);
                  // Automatically sync search number to donor form mobile if donor mobile is empty or matching
                  if (!donorFormData.donorMobile || donorFormData.donorMobile === searchMobile) {
                    setDonorFormData(prev => ({ ...prev, donorMobile: val }));
                  }
                }}
                placeholder="Enter Donor Mobile (e.g. 9876543210)..."
                className="w-full pl-10 pr-10 py-3 bg-white text-slate-800 font-semibold rounded-2xl border-2 border-[#4DA3FF]/40 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none text-sm placeholder:text-slate-400 shadow-inner"
              />
              {searchMobile && (
                <button
                  type="button"
                  onClick={() => setSearchMobile('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Matched Donor History Card */}
            {donorStats && (
              <div className="mt-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 text-slate-800 border border-emerald-300 shadow-md animate-fadeIn">
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <p className="font-bold text-base text-[#0B1F3A]">{donorStats.name || 'Registered Donor'}</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <span>📱 {donorStats.mobile}</span>
                      {donorStats.address && <span>• 📍 {donorStats.address}</span>}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillDonor}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm flex items-center space-x-1 shrink-0 active:scale-95 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Fill Info</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 text-center">
                  <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                    <p className="text-[10px] uppercase font-bold text-emerald-800">Total Donated</p>
                    <p className="text-sm font-black text-emerald-700">{formatCurrency(donorStats.totalAmount)}</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-xl border border-blue-100">
                    <p className="text-[10px] uppercase font-bold text-blue-800">Donations</p>
                    <p className="text-sm font-black text-[#0B1F3A]">{donorStats.count} times</p>
                  </div>
                  <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
                    <p className="text-[10px] uppercase font-bold text-amber-800">Last Contribution</p>
                    <p className="text-xs font-bold text-amber-900 mt-0.5">{new Date(donorStats.lastDonationDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Collapsible toggle for viewing past receipts list */}
                <div className="mt-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowHistoryList(!showHistoryList)}
                    className="w-full flex items-center justify-between text-xs font-bold text-[#0B1F3A] hover:text-[#4DA3FF] transition-colors py-1"
                  >
                    <span className="flex items-center space-x-1.5">
                      <History className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Past Receipts ({donorPastTransactions.length})</span>
                    </span>
                    {showHistoryList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showHistoryList && (
                    <div className="mt-2 space-y-2 max-h-52 overflow-y-auto pr-1">
                      {donorPastTransactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs transition-colors"
                        >
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-slate-800">{tx.category}</span>
                              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                                #{tx.receiptNo || 'N/A'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              {new Date(tx.date).toLocaleDateString()} • {tx.paymentMode}
                              {tx.description ? ` • "${tx.description}"` : ''}
                            </p>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <p className="font-extrabold text-emerald-700">{formatCurrency(tx.amount)}</p>
                            {tx.receiptNo && (
                              <Link
                                to={`/receipt/${tx.id}`}
                                className="text-[11px] text-[#4DA3FF] hover:underline flex items-center justify-end font-semibold mt-0.5"
                              >
                                <span>Receipt</span>
                                <ExternalLink className="w-3 h-3 ml-0.5" />
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {cleanedSearch.length >= 3 && donorPastTransactions.length === 0 && (
              <div className="mt-3 bg-white/10 rounded-2xl p-3 text-xs text-blue-100 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Naya donor record: Is number ka koi pichhla record nahi mila. Nayi receipt banayein.</span>
              </div>
            )}
          </div>

          {/* Detailed Form for With Receipt Mode */}
          <form onSubmit={handleWithReceiptSubmit} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-800 text-base flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>Donor & Donation Information / عطیہ دہندہ کی تفصیل</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Ye sari maloomat banne wali official receipt par print hogi.
              </p>
            </div>

            {/* Donor Name & Mobile Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center">
                  <User className="w-4 h-4 text-slate-400 mr-1.5" />
                  Donor Name / نام *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Haji Mohammad Rashid"
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow text-slate-800 font-medium"
                  value={donorFormData.donorName}
                  onChange={(e) => setDonorFormData({ ...donorFormData, donorName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center">
                  <Phone className="w-4 h-4 text-slate-400 mr-1.5" />
                  Donor Mobile / موبائل نمبر *
                </label>
                <input
                  required
                  type="tel"
                  placeholder="e.g. 9876543210"
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow text-slate-800 font-medium"
                  value={donorFormData.donorMobile}
                  onChange={(e) => setDonorFormData({ ...donorFormData, donorMobile: e.target.value })}
                />
              </div>
            </div>

            {/* Donor Address */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center">
                <MapPin className="w-4 h-4 text-slate-400 mr-1.5" />
                Donor Address / شہر و پتہ (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Phulwari Sharif, Patna / Delhi / London"
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow text-slate-800"
                value={donorFormData.donorAddress}
                onChange={(e) => setDonorFormData({ ...donorFormData, donorAddress: e.target.value })}
              />
            </div>

            {/* Category and Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Category / نوعیتِ عطیہ *
                </label>
                <select
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow text-slate-800 font-medium"
                  value={donorFormData.category}
                  onChange={(e) => setDonorFormData({ ...donorFormData, category: e.target.value })}
                >
                  <option value="Donation">General Donation (عطیہ عام)</option>
                  <option value="Zakat">Zakat (زکوٰۃ)</option>
                  <option value="Sadqah">Sadqah (صدقہ)</option>
                  <option value="Building Fund">Building & Dev Fund (تعمیراتی فنڈ)</option>
                  <option value="Fitra / Imdaad">Fitra / Imdaad (فطرہ و امداد)</option>
                  <option value="Sponsorship">Student Sponsorship (کفالت طلبہ)</option>
                  <option value="Other Income">Other Income (دیگر آمدنی)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Date *</label>
                <input
                  required
                  type="date"
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
                  value={donorFormData.date}
                  onChange={(e) => setDonorFormData({ ...donorFormData, date: e.target.value })}
                />
              </div>
            </div>

            {/* Amount and Payment Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Amount (₹) *</label>
                <input
                  required
                  type="number"
                  min="1"
                  placeholder="0"
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow text-2xl font-black text-emerald-700 bg-emerald-50/70"
                  value={donorFormData.amount}
                  onChange={(e) => setDonorFormData({ ...donorFormData, amount: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Payment Mode</label>
                <select
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow text-slate-800 font-medium"
                  value={donorFormData.paymentMode}
                  onChange={(e) => setDonorFormData({ ...donorFormData, paymentMode: e.target.value })}
                >
                  <option value="Cash">Cash (نقد)</option>
                  <option value="UPI">UPI / Online / GPay / PhonePe</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT / IMPS</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Description / Remarks / Tafseel */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Description / Purpose / Remarks (تفصیل / مقصد)
              </label>
              <input
                type="text"
                placeholder="e.g. Masque construction, Baraye Taleem, etc."
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow text-slate-800"
                value={donorFormData.description}
                onChange={(e) => setDonorFormData({ ...donorFormData, description: e.target.value })}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Ye remarks receipt par &quot;Remarks / Tafseel&quot; section mein shamil kiye jayenge.
              </p>
            </div>

            {/* Submission Button with Receipt Generation Note */}
            <div className="pt-4 space-y-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#0B1F3A] hover:bg-[#152e54] text-white py-4 rounded-xl font-black text-lg active:scale-[0.98] transition-all shadow-xl flex items-center justify-center space-x-2 border-2 border-[#D4AF37]/50 disabled:opacity-50"
              >
                <Receipt className="w-5 h-5 text-[#D4AF37]" />
                <span>{submitting ? 'Generating Receipt...' : 'Save & Generate Receipt / رسید بنائیں'}</span>
              </button>
              <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-500 text-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Automatic official receipt number will be issued with PDF download, print & WhatsApp share.</span>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
