import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { getCurrentUser, clearNotification } from '../services/authService';
import { updateUser } from '../redux/slices/authSlice';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import Profiles from '../pages/Profiles';
import ProfileDetail from '../pages/ProfileDetail';
import CreateProfile from '../pages/CreateProfile';
import UnlockedProfiles from '../pages/UnlockedProfiles';
import Payment from '../pages/Payment';
import AdminDashboard from '../pages/AdminDashboard';
import NotFound from '../pages/NotFound';

// Protected Route Component
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Route Component
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route (redirect to home if already logged in)
export const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRouter = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchCurrentUserData = async () => {
        try {
          const response = await getCurrentUser();
          if (response?.success && response?.data?.user) {
            const user = response.data.user;
            dispatch(updateUser(user));

            // Check for persistent pending notifications
            if (user.pendingNotification) {
              toast.success(user.pendingNotification, {
                duration: 30000,
                id: 'admin-approval-toast', // prevent duplicates
                className: '!bg-gradient-to-r !from-emerald-500 !to-teal-600 !text-white !border-emerald-400 !shadow-2xl',
                style: {
                  background: 'linear-gradient(to right, #10b981, #0d9488)',
                  color: 'white',
                  border: '1px solid #34d399',
                  fontSize: '16px',
                  fontWeight: '600',
                  padding: '16px'
                }
              });
              // Clear it from the server so we don't show it again
              try {
                await clearNotification();
              } catch (err) {
                console.error("Failed to clear notification on backend", err);
              }
            }
          }
        } catch (error) {
          console.error("Failed to sync latest user data:", error);
        }
      };

      // 1. Fetch immediately on mount
      fetchCurrentUserData();

      // 2. Poll every 30 seconds to catch background admin approvals
      const intervalId = setInterval(fetchCurrentUserData, 30000);

      // 3. Fetch immediately when the user switches back to this tab
      const handleFocus = () => fetchCurrentUserData();
      window.addEventListener('focus', handleFocus);

      // Cleanup listeners
      return () => {
        clearInterval(intervalId);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [dispatch, isAuthenticated]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/profiles"
          element={
            <ProtectedRoute>
              <Profiles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <ProfileDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-profile"
          element={
            <ProtectedRoute>
              <CreateProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/unlocked-profiles"
          element={
            <ProtectedRoute>
              <UnlockedProfiles />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

