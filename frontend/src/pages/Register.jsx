import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import bgImage from "../assets/bg2.jpg";

function RegisterForm() {
  const [form, setForm] = useState({
    username: "",
    email:"",
    phone:"",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const { setStep } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!form.username ||!form.email || !form.password || !form.confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    // Save to localStorage
    const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const userExists = existingUsers.some((u) => u.username === form.username);
    const emailExists = existingUsers.some((u) => u.email === form.email);

    if (userExists) {
      setError("Tên đăng nhập đã tồn tại.");
      return;
    }
    if (emailExists) {
      setError("Email đã tồn tại.");
      return;
    }

    existingUsers.push({ username: form.username, password: form.password, email:form.email, phone:form.phone });
    localStorage.setItem("users", JSON.stringify(existingUsers));

    alert("Đăng ký thành công! Hãy đăng nhập.");
    setStep("start"); // Quay lại trang login
  };

  return (
    <div className="w-full h-screen ">
      <div className="flex w-full overflow-hidden">
           
        {/* Right side - Register Form */}
        <div className="w-1/2 p-8 flex flex-col justify-center">
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="logo" className="w-auto h-24" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tên đăng nhập"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="text"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập email của bạn"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Số điện thoại
              </label>
              <input
                id="phone"
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập số điện thoại của bạn"
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
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập mật khẩu"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập lại mật khẩu"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium text-sm"
            >
              Đăng ký
            </button>

            <div className="flex justify-center gap-4 items-center text-gray-600">
              <div className="font-medium text-sm">Đã có tài khoản?</div>
              <button
                type="button"
                onClick={() => setStep("start")}
                className="underline hover:text-black transition-all duration-200 font-medium text-sm"
              >
                Đăng nhập ngay
              </button>
            </div>
          </form>
        </div>

        {/* Left side - Background Image */}
        <div className="w-1/2 h-screen relative">
          <img src={bgImage} alt="Background" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-center p-8">
              <h2 className="text-3xl font-bold mb-4">Tạo tài khoản mới</h2>
              <p className="text-lg">Đăng ký để bắt đầu sử dụng hệ thống eTax Portal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;
