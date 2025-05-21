// src/layout/AuthLayout.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import StartLogin from '../pages/Login';
import Register from '../pages/Register';

export default function AuthLayout() {
  const { step } = useAuth();

  return (
    <div className="w-full h-full">
      <div className="w-full">
        {step === "start" && <StartLogin />}
        {step === "register" && <Register />}
      </div>
    </div>
  );
}
