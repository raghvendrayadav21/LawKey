import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ClientDashboard from './pages/ClientDashboard';
import LawyerDashboard from './pages/LawyerDashboard';
import ChatBot from './components/ChatBot';

function ProtectedRoute({ children, role }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

function App() {
  useEffect(() => {
    const navEntries = performance.getEntriesByType("navigation");
    if (navEntries.length > 0 && navEntries[0].type === "reload") {
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <ChatBot />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/client" element={
            <ProtectedRoute role="ROLE_CLIENT">
              <ClientDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/lawyer" element={
            <ProtectedRoute role="ROLE_LAWYER">
              <LawyerDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
