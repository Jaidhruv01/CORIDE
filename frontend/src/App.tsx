import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { useStore } from './store/useStore';

// Public & Main Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { SearchPage } from './pages/SearchPage';
import { RideDetailPage } from './pages/RideDetailPage';
import { PublishRidePage } from './pages/PublishRidePage';
import { CheckoutPage } from './pages/CheckoutPage';
import { BookingTicketPage } from './pages/BookingTicketPage';
import { ChatPage } from './pages/ChatPage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SafetyPage } from './pages/SafetyPage';

// Dashboard Layout & Subpages
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardOverviewPage } from './pages/DashboardOverviewPage';
import { DashboardTripsPage } from './pages/DashboardTripsPage';
import { DashboardRidesPage } from './pages/DashboardRidesPage';
import { DashboardVehiclesPage } from './pages/DashboardVehiclesPage';
import { DashboardPaymentsPage } from './pages/DashboardPaymentsPage';
import { DashboardProfilePage } from './pages/DashboardProfilePage';

// Admin Layout & Subpages
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminVerificationsPage } from './pages/AdminVerificationsPage';
import { AdminReportsPage } from './pages/AdminReportsPage';
import { AdminRidesListPage } from './pages/AdminRidesListPage';
import { AdminBookingsListPage } from './pages/AdminBookingsListPage';
import { AdminPaymentsPage } from './pages/AdminPaymentsPage';
import { AdminSecurityPage } from './pages/AdminSecurityPage';

export const App: React.FC = () => {
  const { fetchCurrentUser } = useStore();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-[#16131D] text-white">
        <Navbar />
        
        <main className="flex-grow">
          <Routes>
            {/* Public / Rider flow */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/rides/:id" element={<RideDetailPage />} />
            <Route path="/rides/new" element={<PublishRidePage />} />
            <Route path="/checkout/:bookingId" element={<CheckoutPage />} />
            <Route path="/booking/:id" element={<BookingTicketPage />} />
            <Route path="/messages/:bookingId" element={<ChatPage />} />
            <Route path="/profile/:userId" element={<PublicProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/safety" element={<SafetyPage />} />

            {/* Dashboard routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardOverviewPage />} />
              <Route path="trips" element={<DashboardTripsPage />} />
              <Route path="rides" element={<DashboardRidesPage />} />
              <Route path="vehicles" element={<DashboardVehiclesPage />} />
              <Route path="payments" element={<DashboardPaymentsPage />} />
              <Route path="profile" element={<DashboardProfilePage />} />
            </Route>

            {/* Admin portal routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="verifications" element={<AdminVerificationsPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="rides" element={<AdminRidesListPage />} />
              <Route path="bookings" element={<AdminBookingsListPage />} />
              <Route path="payments" element={<AdminPaymentsPage />} />
              <Route path="security" element={<AdminSecurityPage />} />
            </Route>


            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
