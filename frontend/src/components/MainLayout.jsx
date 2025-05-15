import React, { useState } from 'react';
import Sidebar from './Sidebar';
import RealTaxSearch from './RealTaxSearch';

export default function MainLayout({ children }) {
  const [activeMenu, setActiveMenu] = useState(0);

  const renderContent = () => {
    switch (activeMenu) {
      case 1: // Tải tờ khai thuế
        return <RealTaxSearch />;
      default:
        return <div className="p-8">Chức năng đang được phát triển...</div>;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar active={activeMenu} onSelect={setActiveMenu} />
      <main className="flex-1 bg-gray-50">
        {renderContent()}
      </main>
    </div>
  );
} 