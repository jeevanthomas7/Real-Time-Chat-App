import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import { Loader } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useAuthStore';
import { useChatStore } from './store/useChatStore';
import { useLocation } from 'react-router-dom';

// Pages
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';

import BottomNav from './components/layout/BottomNav';

function App() {
  const { authUser, checkAuth, isCheckingAuth, connectSocket } = useAuthStore();
  const { selectedUser } = useChatStore();
  const location = useLocation();

  const hideBottomNav = !authUser || (selectedUser && location.pathname === '/');

  const { subscribeToMessages, subscribeToTypingEvents } = useChatStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authUser) {
      connectSocket();
      subscribeToMessages();
      subscribeToTypingEvents();
    }
  }, [authUser, connectSocket, subscribeToMessages, subscribeToTypingEvents]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background gap-3">
        <Loader className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted animate-pulse">Connecting to Chatify...</p>
      </div>
    );
  }

  return (
    <div className={`bg-background text-text-main min-h-[100dvh] lg:pb-0 ${hideBottomNav ? 'pb-0' : 'pb-16'}`}>
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>
      <BottomNav />
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

export default App;
