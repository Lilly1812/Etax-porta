import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import bgImage from "../assets/bg2.jpg";

function StartLogin() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const { setStep  } = useAuth();

  const handleRegister = (e) => {
    setStep("register");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.password) {
      setError('Vui lòng nhập đầy đủ thông tin đăng nhập.');
      return;
    }
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password })
      });
      if (res.ok) {
        // Đăng nhập thành công
        setStep("search");
      } else {
        const data = await res.json();
        setError(data.detail || 'Tên đăng nhập hoặc mật khẩu không đúng.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ.');
    }
  };

  // Load remembered username if exists
  React.useEffect(() => {
    const rememberedUser = localStorage.getItem("rememberedUser");
    if (rememberedUser) {
      setForm((prev) => ({
        ...prev,
        username: rememberedUser,
        rememberMe: true,
      }));
    }
  }, []);

  return (
    <div className="w-full h-screen flex">
      <div className="flex w-full overflow-hidden">
        {/* Left side - Login Form */}
        <div className="w-1/2 p-8 flex flex-col justify-center">
          {/* Logo */}
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="logo" className="w-auto h-24" />
          </div>
          {/* Form dang nhap */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Tên đăng nhập
              </label>
              <input
                id="username"
                type="text"
                value={form.username}
                onChange={(e) => {
                  setError("");
                  setForm({ ...form, username: e.target.value });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Nhập tên đăng nhập"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => {
                  setError("");
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
                  onChange={(e) =>
                    setForm({ ...form, rememberMe: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-gray-600"
                >
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
<div className="flex items-center justify-center w-full">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="px-4 text-gray-500 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <button
            type="submit"
              className="w-full border bg-white text-black py-3 px-4 rounded-xl  hover:bg-gray-100 transition-all duration-200 font-medium text-sm">
              Đăng nhập với Google
            </button>
            <div className="flex justify-center gap-4  items-center text-gray-600">
              <div className=" font-medium text-sm">Bạn chưa có tài khoản ?</div>
              <button
                type="button"
                onClick={handleRegister}
                className=" underline transition-all duration-200 font-medium text-sm hover:text-black cursor-pointer"
              >
                Đăng ký ngay
              </button>
            </div>
          </form>
        </div>

        {/* Right side - Background Image */}
        <div className="w-1/2 h-screen relative">
          <img
            src={bgImage}
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-center p-8">
              <h2 className="text-3xl font-bold mb-4">
                Chào mừng đến với eTax Portal
              </h2>
              <p className="text-lg">
                Hệ thống kê khai thuế điện tử hiện đại và tiện lợi
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StartLogin;
