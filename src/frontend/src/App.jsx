import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { Landing } from './pages/Landing';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Dashboard } from './pages/Dashboard';
import { Farmers } from './pages/Farmers';
import { WaterManagement } from './pages/WaterManagement';
import { ConflictCenter } from './pages/ConflictCenter';
import { NegotiationRoom } from './pages/NegotiationRoom';
import { Agreement } from './pages/Agreement';
import { AgriEvidence } from './pages/AgriEvidence';

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto bg-slate-950">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Protected Private Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/agri-evidence"
                    element={
                      <ProtectedRoute>
                        <AgriEvidence />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/farmers"
                    element={
                      <ProtectedRoute>
                        <Farmers />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/water-management"
                    element={
                      <ProtectedRoute>
                        <WaterManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/conflict-center"
                    element={
                      <ProtectedRoute>
                        <ConflictCenter />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/negotiation-room"
                    element={
                      <ProtectedRoute>
                        <NegotiationRoom />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/agreement"
                    element={
                      <ProtectedRoute>
                        <Agreement />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
