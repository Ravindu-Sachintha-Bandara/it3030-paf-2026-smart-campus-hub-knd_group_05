import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import OAuth2RedirectHandler from './components/OAuth2RedirectHandler';
import Login from './pages/Login';
import Home from './pages/Home';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import UserDashboard from './pages/user/UserDashboard';
import FullCalendarView from './pages/user/FullCalendarView'; // NEW CALENDAR IMPORT
import Bookings from './pages/Bookings';
import NewBookingRequest from './pages/user/NewBookingRequest'; // NEW IMPORT
import Resources from './pages/Resources';
import AdminTickets from './pages/admin/AdminTickets'; // NEW IMPORT
import MyTickets from './pages/user/MyTickets'; // NEW IMPORT
import NewTicketRequest from './pages/user/NewTicketRequest'; // NEW IMPORT
import Notifications from './pages/Notifications';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import { UserRoute, AdminRoute } from './components/ProtectedRoutes';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

          {/* Protected Area Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/bookings" element={<AdminRoute><AdminBookings /></AdminRoute>} />
            <Route path="/admin/tickets" element={<AdminRoute><AdminTickets /></AdminRoute>} />

            {/* User Routes */}
            <Route path="/user/dashboard" element={<UserRoute><UserDashboard /></UserRoute>} />

            {/* Common Protected Routes */}
            <Route path="/bookings" element={<UserRoute><Bookings /></UserRoute>} />
            <Route path="/bookings/new" element={<UserRoute><NewBookingRequest /></UserRoute>} />
            <Route path="/user/calendar" element={<UserRoute><FullCalendarView /></UserRoute>} />
            
            <Route path="/tickets" element={<UserRoute><MyTickets /></UserRoute>} />
            <Route path="/tickets/new" element={<UserRoute><NewTicketRequest /></UserRoute>} />
            <Route path="/resources" element={<UserRoute><Resources /></UserRoute>} />
            <Route path="/notifications" element={<UserRoute><Notifications /></UserRoute>} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;