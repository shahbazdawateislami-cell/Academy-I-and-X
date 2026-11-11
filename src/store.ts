import { useState, useEffect } from 'react';
import { AppData, Student, Transaction } from './types';
import { addMonthlyFeesIfNeeded } from './utils';
import { db, auth } from './firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, updateDoc, getDocFromServer } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

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
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let globalData: AppData = { students: [], transactions: [] };
let isLoaded = false;

export function useStore() {
  const [data, setData] = useState<AppData>(globalData);
  const [loading, setLoading] = useState(!isLoaded);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    // Validate connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        // Silently fail if not exists, but catch permission errors
        if (error instanceof Error && error.message.includes('insufficient permissions')) {
          console.error("Firebase connection test failed: Insufficient permissions");
        }
      }
    };
    testConnection();

    const migrateData = async () => {
      const STORAGE_KEY = 'al_dahr_academy_data';
      const MIGRATED_KEY = 'al_dahr_academy_firebase_migrated';
      
      if (!localStorage.getItem(MIGRATED_KEY)) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.students && Array.isArray(parsed.students)) {
              for (const student of parsed.students) {
                await addStudent(student);
              }
            }
            if (parsed.transactions && Array.isArray(parsed.transactions)) {
              for (const transaction of parsed.transactions) {
                await addTransaction(transaction);
              }
            }
            localStorage.setItem(MIGRATED_KEY, 'true');
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
          updateDoc(doc(db, 'students', student.id), { ...student }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `students/${student.id}`));
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
  }, [user]);

  const addStudent = async (student: Student) => {
    try {
      await setDoc(doc(db, 'students', student.id), student);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `students/${student.id}`);
    }
  };

  const updateStudent = async (updatedStudent: Student) => {
    try {
      await setDoc(doc(db, 'students', updatedStudent.id), updatedStudent);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `students/${updatedStudent.id}`);
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'students', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `students/${id}`);
    }
  };

  const addTransaction = async (transaction: Transaction) => {
    try {
      await setDoc(doc(db, 'transactions', transaction.id), transaction);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `transactions/${transaction.id}`);
    }
  };

  const updateTransaction = async (updatedTransaction: Transaction) => {
    try {
      await setDoc(doc(db, 'transactions', updatedTransaction.id), updatedTransaction);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `transactions/${updatedTransaction.id}`);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `transactions/${id}`);
    }
  };

  const importData = (importedData: AppData) => {
    importedData.students.forEach(student => addStudent(student));
    importedData.transactions.forEach(transaction => addTransaction(transaction));
  };

  return {
    data,
    loading,
    user,
    addStudent,
    updateStudent,
    deleteStudent,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    importData,
  };
}
