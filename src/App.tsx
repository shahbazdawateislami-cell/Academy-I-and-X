import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import EditStudent from './pages/EditStudent';
import AddStudent from './pages/AddStudent';
import StudentProfile from './pages/StudentProfile';
import CollectFee from './pages/CollectFee';
import AddIncome from './pages/AddIncome';
import AddExpense from './pages/AddExpense';
import History from './pages/History';
import Backup from './pages/Backup';
import Receipt from './pages/Receipt';
import FeeReminders from './pages/FeeReminders';
import { useStore } from './store';

export default function App() {
  const { loading } = useStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0B1F3A] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="fee-reminders" element={<FeeReminders />} />
          <Route path="add-student" element={<AddStudent />} />
          <Route path="edit-student/:id" element={<EditStudent />} />
          <Route path="student/:id" element={<StudentProfile />} />
          <Route path="collect-fee/:id" element={<CollectFee />} />
          <Route path="add-income" element={<AddIncome />} />
          <Route path="add-expense" element={<AddExpense />} />
          <Route path="history" element={<History />} />
          <Route path="backup" element={<Backup />} />
          <Route path="receipt/:id" element={<Receipt />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
