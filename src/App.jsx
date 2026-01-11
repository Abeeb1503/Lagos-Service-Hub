import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Header from './components/layout/Header.jsx'
import Footer from './components/layout/Footer.jsx'
import Home from './pages/Home.jsx'
import Browse from './pages/Browse.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Unauthorized from './pages/Unauthorized.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import SellerProfilePage from './pages/SellerProfilePage.jsx'
import SellerOnboarding from './pages/SellerOnboarding.jsx'
import SellerDashboardPage from './pages/SellerDashboardPage.jsx'
import SellerEarnings from './pages/SellerEarnings.jsx'
import SellerProfileEdit from './pages/SellerProfileEdit.jsx'
import SellerSettings from './pages/SellerSettings.jsx'
import BuyerProfile from './pages/BuyerProfile.jsx'
import BuyerSettings from './pages/BuyerSettings.jsx'
import BuyerDashboardPage from './pages/BuyerDashboardPage.jsx'
import JobDetailsPage from './pages/JobDetailsPage.jsx'
import AdminLayout from './components/admin/AdminLayout.jsx'
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx'
import VerificationQueue from './pages/admin/VerificationQueue.jsx'
import EscrowManagement from './pages/admin/EscrowManagement.jsx'
import DisputeList from './pages/admin/DisputeList.jsx'
import FinancialReports from './pages/admin/FinancialReports.jsx'
import Payment from './pages/Payment.jsx'
import Chat from './pages/Chat.jsx'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

export default function App() {
  const location = useLocation()
  const reduce = useReducedMotion()
  return (
    <AuthProvider>
      <div className="app-wrapper">
        <Header />
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            className="container-xl py-12"
            initial={{ opacity: 0, y: reduce ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -6 }}
            transition={{ duration: reduce ? 0 : 0.25 }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/sellers/:id" element={<SellerProfilePage />} />
              <Route
                path="/payment/:id"
                element={
                  <ProtectedRoute roles={['buyer']}>
                    <Payment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer"
                element={
                  <ProtectedRoute roles={['buyer']}>
                    <BuyerDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:jobId"
                element={
                  <ProtectedRoute roles={['buyer']}>
                    <Chat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/profile"
                element={
                  <ProtectedRoute roles={['buyer']}>
                    <BuyerProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/settings"
                element={
                  <ProtectedRoute roles={['buyer']}>
                    <BuyerSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jobs/:id"
                element={
                  <ProtectedRoute roles={['buyer']}>
                    <JobDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seller"
                element={
                  <ProtectedRoute roles={['seller']}>
                    <SellerDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seller/profile"
                element={
                  <ProtectedRoute roles={['seller']}>
                    <SellerProfileEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seller/settings"
                element={
                  <ProtectedRoute roles={['seller']}>
                    <SellerSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seller/earnings"
                element={
                  <ProtectedRoute roles={['seller']}>
                    <SellerEarnings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute roles={['seller']}>
                    <SellerOnboarding />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="verifications" element={<VerificationQueue />} />
                <Route path="escrow" element={<EscrowManagement />} />
                <Route path="disputes" element={<DisputeList />} />
                <Route path="reports" element={<FinancialReports />} />
                <Route path="settings" element={<div className="text-center">Settings</div>} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.main>
        </AnimatePresence>
        <Footer />
      </div>
    </AuthProvider>
  )
}
