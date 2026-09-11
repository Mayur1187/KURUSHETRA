import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Farmers } from './pages/Farmers';
import { WaterManagement } from './pages/WaterManagement';
import { ConflictCenter } from './pages/ConflictCenter';
import { NegotiationRoom } from './pages/NegotiationRoom';
import { Agreement } from './pages/Agreement';

export function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
          <Navbar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-slate-950">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/farmers" element={<Farmers />} />
                <Route path="/water-management" element={<WaterManagement />} />
                <Route path="/conflict-center" element={<ConflictCenter />} />
                <Route path="/negotiation-room" element={<NegotiationRoom />} />
                <Route path="/agreement" element={<Agreement />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
