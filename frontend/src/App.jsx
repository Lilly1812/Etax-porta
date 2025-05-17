import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';
import { SidebarProvider } from './context/SidebarContext';
import AppContent from './components/AppContent';

function App() {
  return (
    <AuthProvider>
      <CompanyProvider>
        <SidebarProvider>
          <AppContent />
        </SidebarProvider>
      </CompanyProvider>
    </AuthProvider>
  );
}

export default App;
