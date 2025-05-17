import React from 'react';
import { useAuth } from '../context/AuthContext';
import MainLayout from './MainLayout';
import StartLogin from './StartLogin';

export default function AppContent() {
  const { step } = useAuth();

  return step === "start" ? <StartLogin /> : <MainLayout />;
} 