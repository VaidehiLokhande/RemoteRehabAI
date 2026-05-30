import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import RegisterPage from "./pages/RegisterPage";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";

// 1. Protected Route Component (He check karel ki user login aahe ki nahi)
const ProtectedRoute = ({ children, allowedRole }) => {
  const user = JSON.parse(localStorage.getItem("user")); // Login chya veli save kelela data

  if (!user) {
    // Jar login nasel tar login page var pathva
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Jar role chukicha asel (e.g. Patient Doctor page var janyacha prayatna kartoy)
    return <Navigate to={user.role === 'doctor' ? '/doctor' : '/patient'} replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<AuthPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Doctor Routes */}
      <Route 
        path="/doctor" 
        element={
          <ProtectedRoute allowedRole="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Protected Patient Routes */}
      <Route 
        path="/patient" 
        element={
          <ProtectedRoute allowedRole="patient">
            <PatientDashboard />
          </ProtectedRoute>
        } 
      />

      {/* 404 - Jar kontahi route match nahi jhala tar */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;