// src/AppContent.jsx
import React from 'react';
import { useAuth } from './context/AuthContext';
import MainLayout from './layout/MainLayout';
import AuthLayout from './layout/AuthLayout';

export default function AppContent() {
  const { step } = useAuth();

  return step === "start" || step === "register" ? <AuthLayout /> : <MainLayout />;
}
