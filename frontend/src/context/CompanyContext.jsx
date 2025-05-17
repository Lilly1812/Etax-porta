import React, { createContext, useContext, useState } from 'react';

const CompanyContext = createContext();

export function CompanyProvider({ children }) {
  const [selectedCompany, setSelectedCompany] = useState(null);

  return (
    <CompanyContext.Provider value={{ selectedCompany, setSelectedCompany }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
} 