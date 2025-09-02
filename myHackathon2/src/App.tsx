import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import StudentDashboard from './pages/StudentDashboard';
import DonorDashboard from './pages/DonorDashboard';
import AdminDashboard from './pages/AdminDashboard';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/donor-dashboard" element={<DonorDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}