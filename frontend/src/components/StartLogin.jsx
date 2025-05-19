import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import bgImage from '../assets/bg2.jpg';
import RegisterForm from './RegisterForm'; // <-- Bỏ comment dòng này

// Mock user data
const MOCK_USERS = [
  {
    username: 'MinhBT11',
    password: '123456',
  },
  {
    username: 'admin',
    password: 'admin123',
  },
  {
    username: '0109798789-ql',
    password: 'tct@123',
  }
];

function StartLogin() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const { setStep } = useAuth();
  const [showRegister, setShowRegister] = useState(false); // <-- Bỏ comment

  // Kiểm tra đăng nhập với cả mock và localStorage
  const validateLogin = (username, password) => {
    // Kiểm tra localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.username === username && u.password === password)) {
      return true;
    }
    // Kiểm tra mock
    const user = MOCK_USERS.find(
      (user) => user.username === username && user.password === password
    );
    return user !== undefined;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!form.username || !form.password) {
      setError('Vui lòng nhập đầy đủ thông tin đăng nhập.');
      return;
    }

    // Check credentials against mock data and localStorage
    if (validateLogin(form.username, form.password)) {
      // Store in localStorage if remember me is checked
      if (form.rememberMe) {
        localStorage.setItem('rememberedUser', form.username);
      } else {
        localStorage.removeItem('rememberedUser');
      }
      setStep("search");
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không đúng.');
    }
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
    // Có thể hiển thị thông báo hoặc tự động điền username vào form đăng nhập
  };

  // Load remembered username if exists
  React.useEffect(() => {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
      setForm(prev => ({
        ...prev,
        username: rememberedUser,
        rememberMe: true
      }));
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-3xl shadow-2xl flex max-w-6xl w-full overflow-hidden">
        {/* Left side - Login Form */}
        <div className="w-1/2 p-12">
          <div className="flex items-center justify-center mb-8">
            <img src={logo} alt="logo" className="w-auto h-20" />
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Tên đăng nhập
              </label>
              <input
                id="username"
                type="text"
                value={form.username}
                onChange={(e) => {
                  setError('');
                  setForm({ ...form, username: e.target.value });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Nhập tên đăng nhập"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => {
                  setError('');
                  setForm({ ...form, password: e.target.value });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Nhập mật khẩu"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={form.rememberMe}
                  onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-600">
                  Lưu thông tin đăng nhập
                </label>
              </div>
              <a href="#" className="text-sm text-blue-600 hover:underline">
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium text-sm"
            >
              Đăng nhập
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowRegister(true)}
                className="w-full bg-green-500 text-white py-3 px-4 rounded-xl hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-medium text-sm"
              >
                Tạo tài khoản mới
              </button>
            </div>
          </form>
        </div>

        {/* Right side - Background Image */}
        <div className="w-1/2 relative">
          <img 
            src={bgImage} 
            alt="Background" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-center p-8">
              <h2 className="text-3xl font-bold mb-4">Chào mừng đến với eTax Portal</h2>
              <p className="text-lg">Hệ thống kê khai thuế điện tử hiện đại và tiện lợi</p>
            </div>
          </div>
        </div>
      </div>
      {showRegister && (
        <RegisterForm
          onClose={() => setShowRegister(false)}
          onSuccess={handleRegisterSuccess}
        />
      )}
    </div>
  );
}

export default StartLogin;