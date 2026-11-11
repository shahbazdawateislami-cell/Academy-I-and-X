import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { ArrowLeft, Download, Share2, Printer, CheckCircle, MessageSquare, Copy, Check } from 'lucide-react';
import { domToJpeg, domToBlob } from 'modern-screenshot';
import { jsPDF } from 'jspdf';

// A simple WhatsApp icon
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.423-.101.827z"/>
  </svg>
);

export default function Receipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading } = useStore();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const transaction = data.transactions.find((t) => t.id === id);
  const student = data.students.find((s) => s.id === transaction?.studentId);
  const isDonor = !student && Boolean(transaction?.donorName || transaction?.type === 'INCOME');

  if (loading && !transaction) {
    return <div className="text-center py-20 text-slate-500">Loading...</div>;
  }

  if (!transaction || (!student && !isDonor)) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Receipt not found.</p>
        <button onClick={() => navigate('/history')} className="mt-4 text-[#4DA3FF] font-medium">Go to History</button>
      </div>
    );
  }

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    try {
      setDownloading(true);
      // Ensure element is fully rendered before capturing
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const imgData = await domToJpeg(receiptRef.current, { 
        quality: 0.95,
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      // Calculate PDF dimensions
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [receiptRef.current.offsetWidth, receiptRef.current.offsetHeight]
      });
      
      pdf.addImage(imgData, 'JPEG', 0, 0, receiptRef.current.offsetWidth, receiptRef.current.offsetHeight);
      pdf.save(`Receipt_${transaction.receiptNo}.pdf`);
      
    } catch (err: any) {
      console.error('Failed to download PDF receipt', err);
      alert('Failed to generate PDF: ' + (err.message || 'Unknown error'));
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!receiptRef.current) return;
    try {
      setDownloading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const blob = await domToBlob(receiptRef.current, { 
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      if (!blob) {
        alert('Failed to generate image for sharing.');
        setDownloading(false);
        return;
      }
      
      const file = new File([blob], `Receipt_${transaction.receiptNo}.jpg`, { type: 'image/jpeg' });
      
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: isDonor ? `Donation Receipt - ${transaction.donorName || 'Donor'}` : `Fee Receipt - ${student?.name || 'Student'}`,
            text: isDonor ? `Donation Receipt from AL-DAHR Academy for ${transaction.donorName || 'Donor'}` : `Fee Receipt from AL-DAHR Academy for ${student?.name || 'Student'}`,
            files: [file]
          });
        } else {
          // Fallback for browsers that do not support Web Share API with files
          const image = await domToJpeg(receiptRef.current, { quality: 0.95, backgroundColor: '#ffffff', scale: 2 });
          const link = document.createElement('a');
          link.href = image;
          link.download = `Receipt_${transaction.receiptNo}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          alert('Share is not supported directly in this browser. The receipt image has been downloaded instead.');
        }
      } catch (shareErr: any) {
         // User might have canceled the share, ignore if so
         if (shareErr.name !== 'AbortError') {
           console.error('Share failed', shareErr);
           alert('Share failed: ' + (shareErr.message || 'Unsupported feature on this device.'));
         }
      }
      setDownloading(false);
    } catch (err: any) {
      console.error('Error preparing share', err);
      alert('Error generating share image: ' + (err.message || 'Unknown error'));
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const [copiedSMS, setCopiedSMS] = useState(false);

  const buildReceiptTextMessage = () => {
    if (isDonor) {
      return `*AL-DAHR Academy*\n*DONATION RECEIPT*\n\n*Receipt No:* ${transaction.receiptNo}\n*Date:* ${new Date(transaction.date).toLocaleDateString()}\n\n*Donor Name:* ${transaction.donorName || 'Shahbaz'}\n*Mobile:* ${transaction.donorMobile || ''}\n${transaction.donorAddress ? `*Address:* ${transaction.donorAddress}\n` : ''}\n*Category:* ${transaction.category}\n*Payment Mode:* ${transaction.paymentMode}\n${transaction.description ? `*Remarks:* ${transaction.description}\n` : ''}\n*Amount Received:* ${formatCurrency(transaction.amount)}\n\nJazakAllah Khair for your generous contribution to AL-DAHR Academy.\n\n*Management*\n*AL-DAHR Academy*`;
    } else {
      return `*AL-DAHR Academy*\n*FEE RECEIPT*\n\n*Receipt No:* ${transaction.receiptNo}\n*Date:* ${new Date(transaction.date).toLocaleDateString()}\n\n*Student Name:* ${student?.name || ''}\n*Father's Name:* ${student?.fatherName || ''}\n\n*Payment For:* ${transaction.category} ${transaction.month ? `(${transaction.month})` : ''}\n*Payment Mode:* ${transaction.paymentMode}\n${transaction.description ? `*Remarks / Tafseel:* ${transaction.description}\n` : ''}\n*Amount Received:* ${formatCurrency(transaction.amount)}\n\n*Abhi Jama Karna Baki:* ${formatCurrency(transaction.remainingBalanceAfter || 0)}\n\nAapke bachche ki fee mein abhi ${formatCurrency(transaction.remainingBalanceAfter || 0)} jama karna baki hai.\n\nJazakAllah Khair,\n*Management*\n*AL-DAHR Academy*`;
    }
  };

  const handleWhatsAppTextFallback = () => {
    const text = buildReceiptTextMessage();
    const rawMobile = isDonor ? (transaction.donorMobile || '') : (student?.mobile || '');
    const encodedText = encodeURIComponent(text);
    let mobile = rawMobile.replace(/\D/g, '');
    if (mobile.length === 10) {
      mobile = '91' + mobile;
    }
    window.open(`https://wa.me/${mobile}?text=${encodedText}`, '_blank');
  };

  const handleNormalSMS = () => {
    const text = buildReceiptTextMessage();
    const rawMobile = isDonor ? (transaction.donorMobile || '') : (student?.mobile || '');
    let cleanMobile = rawMobile.replace(/\D/g, '');

    // Copy to clipboard as reliable backup
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedSMS(true);
        setTimeout(() => setCopiedSMS(false), 3000);
      }).catch(() => {});
    }

    // iOS uses &body= while Android and other devices use ?body=
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const sep = isIOS ? '&' : '?';
    const smsHref = cleanMobile 
      ? `sms:${cleanMobile}${sep}body=${encodeURIComponent(text)}`
      : `sms:${sep}body=${encodeURIComponent(text)}`;

    window.location.href = smsHref;
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center space-x-3 print:hidden">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-200">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">{isDonor ? 'Donation Receipt' : 'Fee Receipt'}</h2>
      </div>

      <div className="flex justify-center px-2">
        {/* Receipt Container */}
        <div 
          ref={receiptRef}
          className="w-full max-w-[420px] bg-white relative overflow-hidden shadow-2xl"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {/* The decorative border box */}
          <div className="absolute inset-1 border-[1.5px] border-[#0B1F3A] rounded-xl z-10 pointer-events-none"></div>
          <div className="absolute inset-[6px] border border-[#D4AF37] rounded-lg z-10 pointer-events-none"></div>
          
          {/* Corner ornaments */}
          <div className="absolute top-1 left-1 w-6 h-6 border-t-4 border-l-4 border-[#D4AF37] rounded-tl-xl z-20 pointer-events-none"></div>
          <div className="absolute top-1 right-1 w-6 h-6 border-t-4 border-r-4 border-[#D4AF37] rounded-tr-xl z-20 pointer-events-none"></div>
          <div className="absolute bottom-1 left-1 w-6 h-6 border-b-4 border-l-4 border-[#D4AF37] rounded-bl-xl z-20 pointer-events-none"></div>
          <div className="absolute bottom-1 right-1 w-6 h-6 border-b-4 border-r-4 border-[#D4AF37] rounded-br-xl z-20 pointer-events-none"></div>

          {/* Background Pattern / Mosques (Simplified via CSS) */}
          <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-[#e8f2ff] to-white z-0 pointer-events-none flex justify-center items-end opacity-40">
            {/* Mosque silhouettes */}
            <svg viewBox="0 0 400 150" className="w-full h-full text-[#a8c7fa] fill-current">
              <path d="M50 150 L50 100 A20 20 0 0 1 90 100 L90 150 Z" />
              <path d="M70 100 L70 60 A5 5 0 0 1 70 50 A5 5 0 0 1 70 60 Z" />
              <path d="M150 150 L150 80 A40 40 0 0 1 230 80 L230 150 Z" />
              <path d="M190 80 L190 30 A5 5 0 0 1 190 20 A5 5 0 0 1 190 30 Z" />
              <path d="M290 150 L290 100 A20 20 0 0 1 330 100 L330 150 Z" />
              <path d="M310 100 L310 60 A5 5 0 0 1 310 50 A5 5 0 0 1 310 60 Z" />
            </svg>
          </div>

          <div className="relative z-10 px-4 pt-5 pb-3 space-y-2.5">
            {/* Header */}
            <div className="flex flex-col items-center text-center space-y-0.5">
              <h1 className="text-[26px] font-black text-[#0B1F3A] uppercase tracking-wide mt-1" style={{ fontFamily: 'Georgia, serif' }}>AL-DAHR ACADEMY</h1>
              <p className="text-[#D4AF37] text-[9px] font-bold tracking-[0.2em] uppercase mt-1">DEEN • DUNIYA • A BRIGHTER FUTURE</p>
              
              {/* Ribbon */}
              <div className="relative mt-1.5 w-4/5 mx-auto py-1">
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5 bg-[#D4AF37]"></div>
                <div className="relative bg-[#0B1F3A] text-white px-4 py-1 rounded-sm text-xs font-bold uppercase tracking-widest inline-block border-2 border-[#D4AF37] shadow-sm">
                  {isDonor ? '★ DONATION RECEIPT ★' : '★ FEE RECEIPT ★'}
                </div>
              </div>
            </div>

            {/* Section 1: Receipt No & Date */}
            <div className="bg-white border border-[#4DA3FF]/30 rounded-2xl shadow-sm flex divide-x divide-[#4DA3FF]/20 mx-1">
              <div className="flex-1 flex items-center p-2.5">
                <div className="w-8 h-8 rounded-full bg-[#e8f2ff] flex items-center justify-center mr-2.5 text-[#0B1F3A] shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] font-bold text-[#0B1F3A] uppercase tracking-wider mb-0.5">Receipt No</p>
                  <p className="text-xs font-bold text-slate-800 truncate leading-none">{transaction.receiptNo}</p>
                </div>
              </div>
              <div className="flex-1 flex items-center p-2.5">
                <div className="w-8 h-8 rounded-full bg-[#e8f2ff] flex items-center justify-center mr-2.5 text-[#0B1F3A] shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] font-bold text-[#0B1F3A] uppercase tracking-wider mb-0.5">Date</p>
                  <p className="text-xs font-bold text-slate-800 truncate leading-none">{new Date(transaction.date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Section 2: Student or Donor Details */}
            <div className="bg-[#f0f6ff] border border-[#d3e3fc] rounded-2xl shadow-sm p-3 relative overflow-hidden space-y-2.5 mx-1">
              {/* Watermark */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-24 h-24 opacity-10 text-[#4DA3FF] pointer-events-none">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>

              {isDonor ? (
                <>
                  <div className="flex items-center relative z-10">
                    <div className="w-8 h-8 rounded-full bg-[#0B1F3A] flex items-center justify-center mr-3 text-white shadow-sm shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-bold text-[#0B1F3A] uppercase tracking-wider mb-0.5">Donor Name / عطیہ دہندہ</p>
                      <p className="text-lg font-black text-slate-800 truncate leading-none">{transaction.donorName || 'Valued Donor'}</p>
                    </div>
                  </div>

                  {transaction.donorMobile && (
                    <div className="flex items-center relative z-10">
                      <div className="w-8 h-8 rounded-full bg-[#0B1F3A]/10 flex items-center justify-center mr-3 text-[#0B1F3A] shadow-sm shrink-0 border border-[#0B1F3A]/20">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] font-bold text-[#0B1F3A] uppercase tracking-wider mb-0.5">Mobile Number</p>
                        <p className="text-xs font-bold text-slate-700 truncate leading-none">{transaction.donorMobile}</p>
                      </div>
                    </div>
                  )}

                  {transaction.donorAddress && (
                    <div className="flex items-center relative z-10">
                      <div className="w-8 h-8 rounded-full bg-[#0B1F3A]/10 flex items-center justify-center mr-3 text-[#0B1F3A] shadow-sm shrink-0 border border-[#0B1F3A]/20">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] font-bold text-[#0B1F3A] uppercase tracking-wider mb-0.5">Address / پتہ</p>
                        <p className="text-xs font-bold text-slate-700 truncate leading-none">{transaction.donorAddress}</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center relative z-10">
                    <div className="w-8 h-8 rounded-full bg-[#0B1F3A] flex items-center justify-center mr-3 text-white shadow-sm shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-bold text-[#0B1F3A] uppercase tracking-wider mb-0.5">Student Name</p>
                      <p className="text-lg font-black text-slate-800 truncate leading-none">{student?.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center relative z-10">
                    <div className="w-8 h-8 rounded-full bg-[#0B1F3A]/10 flex items-center justify-center mr-3 text-[#0B1F3A] shadow-sm shrink-0 border border-[#0B1F3A]/20">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-bold text-[#0B1F3A] uppercase tracking-wider mb-0.5">Father's Name</p>
                      <p className="text-xs font-bold text-slate-700 truncate leading-none">{student?.fatherName}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Section 3: Payment Details */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-3 space-y-2.5 mx-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-[#0B1F3A] flex items-center justify-center mr-2 text-white shrink-0">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                  </div>
                  <span className="text-[10px] font-bold text-[#0B1F3A] uppercase tracking-wide">{isDonor ? 'Contribution / عطیہ' : 'Payment For'}</span>
                </div>
                <span className="text-xs font-bold text-slate-800 text-right">{transaction.category}</span>
              </div>
              
              {transaction.month && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[#0B1F3A] flex items-center justify-center mr-2 text-white shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <span className="text-[10px] font-bold text-[#0B1F3A] uppercase tracking-wide">Month</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800 text-right">{transaction.month}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center mr-2 text-white shrink-0">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <span className="text-[10px] font-bold text-[#0B1F3A] uppercase tracking-wide">Payment Mode</span>
                </div>
                <span className="text-xs font-bold text-slate-800 text-right">{transaction.paymentMode}</span>
              </div>

              {/* Notes / Remarks */}
              {transaction.description && (
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center shrink-0">
                      <div className="w-6 h-6 rounded-full bg-[#0B1F3A] flex items-center justify-center mr-2 text-white shrink-0">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                      </div>
                      <span className="text-[10px] font-bold text-[#0B1F3A] uppercase tracking-wide">Remarks / Tafseel</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800 text-right max-w-[210px] break-words bg-amber-50/80 px-2 py-1 rounded border border-amber-200">
                      {transaction.description}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Amounts */}
            <div className="space-y-2 mx-1">
              {/* Amount Received */}
              <div className="flex items-center justify-between bg-[#e6f4ea] border border-[#bce4c8] px-3 py-2 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <div className="w-7 h-7 rounded-full bg-[#1e8e3e] flex items-center justify-center mr-2.5 text-white shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <span className="text-[10px] font-bold text-[#1e8e3e] uppercase tracking-wide">Amount Received</span>
                </div>
                <span className="text-2xl font-black text-[#1e8e3e]">{formatCurrency(transaction.amount)}</span>
              </div>
              
              {/* Remaining / Status */}
              {!isDonor ? (
                <div className="flex items-center justify-between bg-[#fce8e6] border border-[#fad2cf] px-3 py-2 rounded-xl shadow-sm">
                  <div className="flex items-center">
                    <div className="w-7 h-7 rounded-full bg-[#d93025] flex items-center justify-center mr-2.5 text-white shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
                    </div>
                    <span className="text-[10px] font-bold text-[#d93025] uppercase tracking-wide">Remaining Balance</span>
                  </div>
                  <span className="text-xl font-black text-[#d93025]">{transaction.remainingBalanceAfter && transaction.remainingBalanceAfter > 0 ? `-${formatCurrency(transaction.remainingBalanceAfter)}` : '₹0'}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-[#eff6ff] border border-[#bfdbfe] px-3 py-2 rounded-xl shadow-sm">
                  <div className="flex items-center">
                    <div className="w-7 h-7 rounded-full bg-[#2563eb] flex items-center justify-center mr-2.5 text-white shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <span className="text-[10px] font-bold text-[#2563eb] uppercase tracking-wide">Receipt Status</span>
                  </div>
                  <span className="text-xs font-bold text-[#1d4ed8]">Received with Thanks / وصول پایا</span>
                </div>
              )}
            </div>
            
            {/* Thank You */}
            <div className="text-center pt-0.5 pb-1">
              <p className="text-lg font-bold text-[#0B1F3A] italic" style={{ fontFamily: 'Georgia, serif' }}>Thank You!</p>
              <div className="flex items-center justify-center space-x-2 mt-0.5">
                <div className="w-1 h-1 rotate-45 border border-[#D4AF37]"></div>
                <div className="h-px w-8 bg-[#D4AF37]"></div>
                <p className="text-[9px] font-medium text-[#0B1F3A]">For your trust and support.</p>
                <div className="h-px w-8 bg-[#D4AF37]"></div>
                <div className="w-1 h-1 rotate-45 border border-[#D4AF37]"></div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[#0B1F3A] text-white pt-2.5 pb-0 relative z-10 rounded-b-[10px] border-t-4 border-[#D4AF37] mx-1 mb-1 shadow-inner overflow-hidden">
            <div className="flex justify-between items-center text-[7px] md:text-[8px] mb-2.5 opacity-90 px-3">
              <div className="flex items-center">
                <svg className="w-2.5 h-2.5 mr-1 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                Phulwari Sharif, Patna
              </div>
              <div className="flex items-center">
                <svg className="w-2.5 h-2.5 mr-1 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                +91 70799 88808
              </div>
              <div className="flex items-center">
                <svg className="w-2.5 h-2.5 mr-1 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd"></path></svg>
                +91 79708 76487
              </div>
            </div>
            <div className="text-center bg-[#D4AF37] text-[#0B1F3A] py-1.5 w-full">
              <p className="text-[8px] font-black uppercase tracking-widest leading-none mb-0.5">Management</p>
              <p className="text-xs font-black leading-none">AL-DAHR Academy</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4 px-2 print:hidden max-w-sm mx-auto">
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center justify-center space-x-2 bg-[#0B1F3A] text-white py-3.5 rounded-xl font-bold shadow-md hover:bg-[#0f2a4a] active:scale-95 transition-all disabled:opacity-70 text-sm"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Please wait...' : 'Download PDF'}</span>
          </button>
          <button 
            onClick={handleShare}
            disabled={downloading}
            className="flex items-center justify-center space-x-2 bg-[#4DA3FF] text-white py-3.5 rounded-xl font-bold shadow-md hover:bg-[#3d8be0] active:scale-95 transition-all disabled:opacity-70 text-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>Share File</span>
          </button>
          <button 
            onClick={handleWhatsAppTextFallback}
            className="flex items-center justify-center space-x-2 bg-emerald-600 text-white py-3.5 rounded-xl font-bold shadow-sm hover:bg-emerald-700 active:scale-95 transition-all text-sm"
          >
            <WhatsAppIcon className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>
          <button 
            onClick={handleNormalSMS}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-sm hover:bg-blue-700 active:scale-95 transition-all text-sm"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Normal SMS</span>
          </button>
        </div>

        {/* Print & Copy Text Row */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center justify-center space-x-2 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold shadow-sm hover:bg-slate-50 active:scale-95 transition-all text-xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Receipt</span>
          </button>
          <button 
            onClick={() => {
              const text = buildReceiptTextMessage();
              navigator.clipboard.writeText(text).then(() => {
                setCopiedSMS(true);
                setTimeout(() => setCopiedSMS(false), 2500);
              });
            }}
            className="flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold active:scale-95 transition-all text-xs border border-slate-200"
          >
            {copiedSMS ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Text Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy SMS Text</span>
              </>
            )}
          </button>
        </div>

        {/* Keypad Phone Normal SMS Note */}
        <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-3 text-center text-xs text-blue-900 shadow-sm">
          <p className="font-bold flex items-center justify-center gap-1.5 text-blue-950">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>Keypad Phone SMS / نارمل میسج</span>
          </p>
          <p className="text-[11px] text-blue-700 mt-1 leading-relaxed">
            <strong>&quot;Normal SMS&quot;</strong> پر کلک کرتے ہی فون کا میسج ایپ کھل جائے گا اور سادہ کی پیڈ فون پر بھی یہ رسید بغیر انٹرنیٹ بھیجی جا سکے گی۔
          </p>
        </div>
      </div>

      {/* Global styles to ensure print looks okay */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #root {
            padding: 0 !important;
            margin: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          div[ref] {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          div[ref] * {
            visibility: visible;
          }
        }
      `}</style>
    </div>
  );
}
