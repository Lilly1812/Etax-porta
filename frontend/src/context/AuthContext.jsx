import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [step, setStep] = useState("start");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentCompanyAuth, setCurrentCompanyAuth] = useState(null);

  const handleLogout = () => {
    setStep("start");
    setIsLoggedIn(false);
    setCurrentCompanyAuth(null);
  };

  const handleCompanyChange = (companyTaxId) => {
    // When company changes, reset auth state
    setIsLoggedIn(false);
    setCurrentCompanyAuth(null);
    setStep("login");
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setStep("authenticated");
  };

  return (
    <AuthContext.Provider value={{ 
      step, 
      setStep, 
      handleLogout,
      isLoggedIn,
      handleLogin,
      handleCompanyChange,
      currentCompanyAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 