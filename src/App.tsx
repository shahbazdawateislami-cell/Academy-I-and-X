/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

export default function App() {
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
