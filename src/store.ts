import { useState, useEffect } from 'react';
import { AppData, Student, Transaction } from './types';
import { addMonthlyFeesIfNeeded } from './utils';
import { db } from './firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, updateDoc } from 'firebase/firestore';

let globalData: AppData = { students: [], transactions: [] };
let isLoaded = false;

export function useStore() {
  const [data, setData] = useState<AppData>(globalData);
  const [loading, setLoading] = useState(!isLoaded);

  useEffect(() => {
    // If it's already loaded, we still want to set up listeners if they aren't somehow,
    // but in Firebase, multiple onSnapshot calls on the same query are fine, 
    // or we can just let it attach.
    
    // Migrate from local storage if data exists and hasn't been migrated
    const STORAGE_KEY = 'al_dahr_academy_data';
    const MIGRATED_KEY = 'al_dahr_academy_firebase_migrated';
    
    const migrateData = async () => {
      if (!localStorage.getItem(MIGRATED_KEY)) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.students && Array.isArray(parsed.students)) {
              for (const student of parsed.students) {
                await setDoc(doc(db, 'students', student.id), student);
              }
            }
            if (parsed.transactions && Array.isArray(parsed.transactions)) {
              for (const transaction of parsed.transactions) {
                await setDoc(doc(db, 'transactions', transaction.id), transaction);
              }
            }
            localStorage.setItem(MIGRATED_KEY, 'true');
            console.log("Successfully migrated data to Firebase.");
          } catch (e) {
            console.error('Failed to migrate local storage data', e);
          }
        } else {
          // If no local data, just mark as migrated
          localStorage.setItem(MIGRATED_KEY, 'true');
        }
      }
    };
    
    migrateData();

    const studentsRef = collection(db, 'students');
    const unsubscribeStudents = onSnapshot(query(studentsRef), (snapshot) => {
      const studentsList = snapshot.docs.map(doc => doc.data() as Student);
      
      const { newStudents, updated } = addMonthlyFeesIfNeeded(studentsList);
      
      if (updated) {
        newStudents.forEach(student => {
          updateDoc(doc(db, 'students', student.id), { ...student });
        });
      }
      
      globalData = { ...globalData, students: newStudents };
      isLoaded = true;
      setData(globalData);
      setLoading(false);
    });

    const transactionsRef = collection(db, 'transactions');
    const unsubscribeTransactions = onSnapshot(query(transactionsRef), (snapshot) => {
      const transactionsList = snapshot.docs.map(doc => doc.data() as Transaction);
      // Sort transactions by date descending to match local storage behavior (where new ones were prepended)
      transactionsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      globalData = { ...globalData, transactions: transactionsList };
      isLoaded = true;
      setData(globalData);
      setLoading(false);
    });

    return () => {
      unsubscribeStudents();
      unsubscribeTransactions();
    };
  }, []);

  const addStudent = async (student: Student) => {
    setDoc(doc(db, 'students', student.id), student).catch(console.error);
  };

  const updateStudent = async (updatedStudent: Student) => {
    setDoc(doc(db, 'students', updatedStudent.id), updatedStudent).catch(console.error);
  };

  const deleteStudent = async (id: string) => {
    deleteDoc(doc(db, 'students', id)).catch(console.error);
  };

  const addTransaction = async (transaction: Transaction) => {
    setDoc(doc(db, 'transactions', transaction.id), transaction).catch(console.error);
  };

  const updateTransaction = async (updatedTransaction: Transaction) => {
    setDoc(doc(db, 'transactions', updatedTransaction.id), updatedTransaction).catch(console.error);
  };

  const deleteTransaction = async (id: string) => {
    deleteDoc(doc(db, 'transactions', id)).catch(console.error);
  };

  const importData = (importedData: AppData) => {
    importedData.students.forEach(student => {
      setDoc(doc(db, 'students', student.id), student);
    });
    importedData.transactions.forEach(transaction => {
      setDoc(doc(db, 'transactions', transaction.id), transaction);
    });
  };

  return {
    data,
    loading,
    addStudent,
    updateStudent,
    deleteStudent,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    importData,
  };
}
