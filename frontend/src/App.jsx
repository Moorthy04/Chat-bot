import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

// Eager load main page
import ChatPage from './pages/ChatPage';

// Lazy load other pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SetNameModal = lazy(() => import('./components/Modals/SetNameModal'));

import ProtectedRoute from './components/Auth/ProtectedRoute';
import PublicRoute from './components/Auth/PublicRoute';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <Routes location={location}>
            <Route path="/" element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            } />
            <Route path="/chat/:id?" element={
              <ProtectedRoute>
                <>
                  <ChatPage />
                  <SetNameModal />
                </>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <>
                  <ProfilePage />
                  <SetNameModal />
                </>
              </ProtectedRoute>
            } />
            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <ChatProvider>
            <AnimatedRoutes />
            <Toaster position="top-center" />
          </ChatProvider>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
