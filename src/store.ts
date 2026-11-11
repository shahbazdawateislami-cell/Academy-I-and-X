import { useState, useEffect } from 'react';
import { AppData, Student, Transaction } from './types';
import { addMonthlyFeesIfNeeded } from './utils';
import { db } from './firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, updateDoc, getDocFromServer } from 'firebase/firestore';

let globalData: AppData = { students: [], transactions: [] };
let isLoaded = false;

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      // Auth is not currently used in this app but we include it for the error schema
      userId: null,
      email: null,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // In a production app we might throw here, but for this store we'll just log and potentially show a UI alert
}

export function useStore() {
  const [data, setData] = useState<AppData>(globalData);
  const [loading, setLoading] = useState(!isLoaded);

  useEffect(() => {
    // Connection test
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client appears to be offline.");
        }
      }
    };
    testConnection();

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
          updateDoc(doc(db, 'students', student.id), { ...student }).catch(err => {
            handleFirestoreError(err, OperationType.UPDATE, `students/${student.id}`);
          });
        });
      }
      
      globalData = { ...globalData, students: newStudents };
      isLoaded = true;
      setData(globalData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'students');
    });

    const transactionsRef = collection(db, 'transactions');
    const unsubscribeTransactions = onSnapshot(query(transactionsRef), (snapshot) => {
      const transactionsList = snapshot.docs.map(doc => doc.data() as Transaction);
      transactionsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      globalData = { ...globalData, transactions: transactionsList };
      isLoaded = true;
      setData(globalData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
    });

    return () => {
      unsubscribeStudents();
      unsubscribeTransactions();
    };
  }, []);

  const addStudent = async (student: Student) => {
    try {
      await setDoc(doc(db, 'students', student.id), student);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `students/${student.id}`);
    }
  };

  const updateStudent = async (updatedStudent: Student) => {
    try {
      await setDoc(doc(db, 'students', updatedStudent.id), updatedStudent);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `students/${updatedStudent.id}`);
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'students', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `students/${id}`);
    }
  };

  const addTransaction = async (transaction: Transaction) => {
    try {
      await setDoc(doc(db, 'transactions', transaction.id), transaction);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `transactions/${transaction.id}`);
    }
  };

  const updateTransaction = async (updatedTransaction: Transaction) => {
    try {
      await setDoc(doc(db, 'transactions', updatedTransaction.id), updatedTransaction);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `transactions/${updatedTransaction.id}`);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `transactions/${id}`);
    }
  };

  const importData = (importedData: AppData) => {
    importedData.students.forEach(student => {
      setDoc(doc(db, 'students', student.id), student).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `students/${student.id}`);
      });
    });
    importedData.transactions.forEach(transaction => {
      setDoc(doc(db, 'transactions', transaction.id), transaction).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `transactions/${transaction.id}`);
      });
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
