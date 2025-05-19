import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';
import { SidebarProvider } from './context/SidebarContext';
import AppContent from './components/AppContent';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <CompanyProvider>
        <SidebarProvider>
          <>
            <AppContent />
            <ToastContainer />
          </>
        </SidebarProvider>
      </CompanyProvider>
    </AuthProvider>
  );
}

export default App;