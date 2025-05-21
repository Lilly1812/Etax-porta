import React, { useState } from 'react';
import { CompanyProvider } from '../context/CompanyContext';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Company from '../pages/Company';
import RealTaxSearch from '../pages/RealTaxSearch';
import LoginForm from '../components/TaxsystemLogin';
import TaxObligationSearch from '../pages/TaxObligationSearch';
import TaxPayment from '../pages/TaxPayment';

export default function MainLayout() {
  const [activeMenu, setActiveMenu] = useState(0);
  const { sidebarCollapsed, setSidebarCollapsed } = useSidebar();
  const { step, isLoggedIn } = useAuth();

  const handleLoginSuccess = () => {
    // Navigate to Dashboard (Tổng quan) after successful login
    setActiveMenu(1);
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 0: // Company selection
        if (step === "login") {
          return <LoginForm onLoginSuccess={handleLoginSuccess} />;
        }
        return <Company />;
      case 1: // Dashboard
        return <div className="p-8">Tổng quan đang được phát triển...</div>;
      case 2: // Tax declaration
        return isLoggedIn ? <RealTaxSearch /> : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 bg-yellow-50 rounded-xl">
              <p className="text-yellow-800">Vui lòng chọn công ty và đăng nhập để sử dụng chức năng này</p>
            </div>
          </div>
        );
      case 3: // Tax obligation search
        return isLoggedIn ? <TaxObligationSearch /> : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 bg-yellow-50 rounded-xl">
              <p className="text-yellow-800">Vui lòng chọn công ty và đăng nhập để sử dụng chức năng này</p>
            </div>
          </div>
        );
      case 4: // Tax payment
        return isLoggedIn ? <TaxPayment /> : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 bg-yellow-50 rounded-xl">
              <p className="text-yellow-800">Vui lòng chọn công ty và đăng nhập để sử dụng chức năng này</p>
            </div>
          </div>
        );
      default:
        return <div className="p-8">Chức năng đang được phát triển...</div>;
    }
  };

  return (
    <CompanyProvider>
      <div className="h-screen flex overflow-hidden">
        <div className="fixed top-0 left-0 h-full z-10">
          <Sidebar 
            active={activeMenu} 
            onSelect={setActiveMenu} 
            onCollapse={(collapsed) => setSidebarCollapsed(collapsed)}
          />
        </div>
        <div className={`flex flex-col flex-1 ${sidebarCollapsed ? 'ml-18' : 'ml-60'} transition-all duration-300`}>
          <div className={`fixed top-0 right-0 ${sidebarCollapsed ? 'left-18' : 'left-60'} z-5 transition-all duration-300`}>
            <Header />
          </div>
          <main className="flex-1 overflow-auto mt-16 bg-gray-100">
            {renderContent()}
          </main>
        </div>
      </div>
    </CompanyProvider>
  );
} 