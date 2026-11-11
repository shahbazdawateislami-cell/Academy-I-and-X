import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const generateReceiptNo = () => {
  const date = new Date();
  const year = date.getFullYear().toString();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ADA-${year}-${random}`;
};

import { Student } from './types';

export const addMonthlyFeesIfNeeded = (students: Student[]) => {
  let updated = false;
  const newStudents = students.map(student => {
    if (!student.monthlyFee) return student;
    
    let lastMonth = student.lastFeeAddedMonth;
    if (!lastMonth) {
      lastMonth = student.admissionDate.substring(0, 7);
      updated = true;
    }
    
    const today = new Date();
    const currentMonthStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
    
    if (lastMonth < currentMonthStr) {
      let [lastYear, lastM] = lastMonth.split('-').map(Number);
      const [currYear, currM] = currentMonthStr.split('-').map(Number);
      
      let monthsToAdd = (currYear - lastYear) * 12 + (currM - lastM);
      if (monthsToAdd > 0) {
        const addedFee = monthsToAdd * student.monthlyFee;
        updated = true;
        return {
          ...student,
          totalFee: student.totalFee + addedFee,
          remainingFee: student.remainingFee + addedFee,
          lastFeeAddedMonth: currentMonthStr
        };
      }
    }
    
    if (!student.lastFeeAddedMonth) {
      return { ...student, lastFeeAddedMonth: lastMonth };
    }
    
    return student;
  });
  
  return { newStudents, updated };
};

export const generateWhatsAppReminderLink = (student: Student) => {
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
  
  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  
  const text = `*AL-DAHR Academy*\n*Fee Reminder*\n\nAssalamu Alaikum,\n\nAapke bachche *${student.name}* ki fee ki detail:\n\n*Pichhla Baki:* ${formatCurrency(prevDue)}\n\n*Is Mahine Ki Fee (${currentMonthName}):* ${formatCurrency(currMonth)}\n\n*Abhi Kul Jama Karna Hai:* ${formatCurrency(totalDue)}\n\nBaraye karam fee waqt par jama kar dein.\n\nAgar payment pehle hi jama kar chuke hain to is message ko nazar-andaz kar dein.\n\nJazakAllah Khair,\n*Management*\n*AL-DAHR Academy*`;
  
  const encodedText = encodeURIComponent(text);
  let mobile = student.mobile.replace(/\D/g, '');
  if (mobile.length === 10) {
    mobile = '91' + mobile;
  }
  return `https://wa.me/${mobile}?text=${encodedText}`;
};
