// App.jsx – Root router with auth guard
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './utils/AuthContext'

import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import VendorList from './pages/VendorList'
import VendorForm from './pages/VendorForm'
import DailyCollection from './pages/DailyCollection'
import PendingPayments from './pages/PendingPayments'
import PaymentHistory from './pages/PaymentHistory'
import Analytics from './pages/Analytics'
import Spinner from './components/Spinner'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="vendors" element={<VendorList />} />
          <Route path="vendors/add" element={<VendorForm />} />
          <Route path="vendors/edit/:id" element={<VendorForm />} />
          <Route path="collection" element={<DailyCollection />} />
          <Route path="pending" element={<PendingPayments />} />
          <Route path="history" element={<PaymentHistory />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" toastOptions={{ className: 'text-sm font-medium' }} />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
