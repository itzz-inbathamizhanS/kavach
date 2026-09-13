import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated as checkAuth, logout as apiLogout } from './api/apiClient';

import { Header } from './components/Header';
import { Footer } from './components/Footer';

import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { AdvisoriesScreen } from './screens/AdvisoriesScreen';
import { IndicatorsScreen } from './screens/IndicatorsScreen';
import { EnforcementScreen } from './screens/EnforcementScreen';
import { ApprovalsScreen } from './screens/ApprovalsScreen';
import { LedgerScreen } from './screens/LedgerScreen';
import { SettingsScreen } from './screens/SettingsScreen';

import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuth());

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-page-bg text-on-surface">
          <Header onLogout={() => { setIsAuthenticated(false); apiLogout(); }} />
          <main className="flex-1 w-full max-w-[1200px] mx-auto px-margin pt-20 pb-space-xl">
            <Routes>
              <Route path="/" element={<DashboardScreen />} />
              <Route path="/advisories" element={<AdvisoriesScreen />} />
              <Route path="/indicators" element={<IndicatorsScreen />} />
              <Route path="/enforcement" element={<EnforcementScreen />} />
              <Route path="/approvals" element={<ApprovalsScreen />} />
              <Route path="/ledger" element={<LedgerScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
