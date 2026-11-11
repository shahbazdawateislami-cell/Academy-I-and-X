import React from 'react';
import { Category, SchoolSettings, Transaction } from '../../types/finance';
import { formatCurrency } from '../../utils/financeAnalytics';
import { X, Printer, CheckCircle, FileText, Download } from 'lucide-react';

interface ReceiptSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  category?: Category;
  settings: SchoolSettings;
}

// Convert amount to simple words
const amountToWords = (amount: number, currency = 'Rupees'): string => {
  const rounded = Math.round(amount);
  if (rounded === 0) return `Zero ${currency} Only`;
  return `${rounded.toLocaleString('en-IN')} ${currency} Only`;
};

export const ReceiptSlipModal: React.FC<ReceiptSlipModalProps> = ({
  isOpen,
  onClose,
  transaction,
  category,
  settings,
}) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const isIncome = transaction.type === 'income';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Modal Controls Bar (Hidden during printing) */}
        <div className="print:hidden flex items-center justify-between px-6 py-3.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Official Receiving Voucher / Raseed Slip
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receiving Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-8 bg-white text-slate-900 selection:bg-slate-200 print:p-0 print:m-0" id="printable-receipt">
          {/* Main Border Box */}
          <div className="border-2 border-slate-800 p-6 rounded-lg space-y-5">
            {/* School Header */}
            <div className="text-center border-b-2 border-slate-800 pb-4">
              <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900 font-serif">
                {settings.schoolName}
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Residential School & Hostel Campus · {settings.academicTerm}
              </p>
              <div className="inline-block mt-2 px-3 py-1 bg-slate-900 text-white text-xs font-semibold uppercase tracking-widest rounded-xs">
                {isIncome ? 'OFFICIAL FEE RECEIVING SLIP / واؤچر رسید' : 'DISBURSEMENT & PAYMENT VOUCHER / رسید خرچ'}
              </div>
            </div>

            {/* Voucher Metadata Bar */}
            <div className="grid grid-cols-3 gap-2 text-xs border-b border-slate-300 pb-3 font-mono">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-sans">Voucher / Receipt No</span>
                <span className="font-bold text-slate-900 text-sm">
                  {transaction.voucherNo || `REC-${transaction.id.slice(-6).toUpperCase()}`}
                </span>
              </div>
              <div className="text-center">
                <span className="text-slate-500 block text-[10px] uppercase font-sans">Transaction Date</span>
                <span className="font-bold text-slate-900 text-sm">{transaction.date}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px] uppercase font-sans">Payment Channel</span>
                <span className="font-bold text-slate-900 text-sm">{transaction.paymentMethod}</span>
              </div>
            </div>

            {/* Student / Payee Details */}
            {(transaction.studentName || transaction.payeeOrMerchant) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded border border-slate-200 text-xs">
                {transaction.studentName && (
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Student Name:</span>
                    <strong className="text-slate-900 text-sm font-semibold">{transaction.studentName}</strong>
                  </div>
                )}
                {transaction.studentRollNo && (
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Roll No:</span>
                    <strong className="text-slate-900 font-mono">{transaction.studentRollNo}</strong>
                  </div>
                )}
                {transaction.classGrade && (
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Class / Grade:</span>
                    <strong className="text-slate-900">{transaction.classGrade}</strong>
                  </div>
                )}
                {transaction.hostelRoomNo && (
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Hostel Dorm:</span>
                    <strong className="text-slate-900">{transaction.hostelRoomNo}</strong>
                  </div>
                )}
                {transaction.payeeOrMerchant && (
                  <div className="col-span-2">
                    <span className="text-slate-500 block text-[10px] uppercase">Payee / Vendor / Donor:</span>
                    <strong className="text-slate-900">{transaction.payeeOrMerchant}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Account Particulars Table */}
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-300">
                <tr>
                  <th className="py-2 px-3 font-semibold">Account / Fee Description</th>
                  <th className="py-2 px-3 font-semibold">Head</th>
                  <th className="py-2 px-3 text-right font-semibold">Amount ({settings.currencySymbol})</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-2.5 px-3 font-medium text-slate-900">
                    {transaction.title}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {category?.name || 'General Account'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold font-mono tabular-nums text-slate-900">
                    {formatCurrency(transaction.amount, settings.currencySymbol)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 font-semibold">
                <tr>
                  <td colSpan={2} className="py-2 px-3 text-slate-700 text-right uppercase text-[11px]">
                    Total Received / Paid:
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-base font-bold text-slate-900">
                    {formatCurrency(transaction.amount, settings.currencySymbol)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* CRITICAL: THIS EXACT COLUMN / REMARKS / NOTES SECTION ON RECEIVING */}
            <div className="rounded-md border-2 border-slate-900 p-3.5 bg-slate-50/80">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <FileText className="w-3.5 h-3.5 text-sky-700" />
                  <span>Receiving Remarks & Particulars / رسید کی تفصیل (اس کالم کا اندراج):</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Verified Entry</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-300 rounded text-slate-900 font-medium text-xs leading-relaxed min-h-[38px]">
                {transaction.notes && transaction.notes.trim() ? (
                  <span className="text-slate-900 font-semibold">{transaction.notes}</span>
                ) : (
                  <span className="text-slate-400 italic">No additional remarks specified in the column.</span>
                )}
              </div>
            </div>

            {/* Amount in Words */}
            <div className="text-xs text-slate-700 border-b border-slate-200 pb-2">
              <span className="text-slate-500 text-[10px] uppercase block">Amount in words:</span>
              <strong className="text-slate-900 font-serif italic">
                {amountToWords(transaction.amount)}
              </strong>
            </div>

            {/* Signatures & Seal */}
            <div className="grid grid-cols-2 pt-6 gap-8 text-center text-xs">
              <div>
                <div className="border-t border-slate-800 pt-1.5 font-semibold text-slate-800">
                  Receiver / Cashier Signature
                </div>
                <span className="text-[10px] text-slate-400">Account Office Stamp</span>
              </div>
              <div>
                <div className="border-t border-slate-800 pt-1.5 font-semibold text-slate-800">
                  Hostel Warden / Principal
                </div>
                <span className="text-[10px] text-slate-400">Authorized Official</span>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-200">
              Computerized Official Receiving Slip generated by FinPulse Residential School System.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
