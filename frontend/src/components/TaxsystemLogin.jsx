// src/components/Login.js
import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { FiRefreshCw, FiUser, FiLock, FiShield } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useCompany } from "../context/CompanyContext";
import "../App.css";

function Spinner({ size = 5 }) {
  return (
    <div
      className={`w-${size} h-${size} border-2 border-white border-t-transparent rounded-full animate-spin`}
    />
  );
}

export default function LoginForm({ onLoginSuccess }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    captcha_code: "",
  });
  const [dates, setDates] = useState({ from: "", to: "" });
  const [step, setStep] = useState("login");
  const [captchaUrl, setCaptchaUrl] = useState(null);
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const { handleLogin } = useAuth();
  const { selectedCompany } = useCompany();

  useEffect(() => {
    const loadCaptcha = async () => {
      try {
        await axios.get("http://localhost:8000/access");
        setCaptchaUrl(`http://localhost:8000/captcha?ts=${Date.now()}`);
      } catch (err) {
        console.error("Failed to load captcha", err);
      }
    };
    loadCaptcha();
  }, []);

const handleLoginSubmit = async (e) => {
  e.preventDefault();
  setLoadingLogin(true);
  
  // Validate form
  if (!form.username || !form.password || !form.captcha_code) {
    alert('Vui lòng điền đầy đủ thông tin đăng nhập');
    setLoadingLogin(false);
    return;
  }

  try {
    const formData = new FormData();
    formData.append('username', form.username);
    formData.append('password', form.password);
    formData.append('captcha_code', form.captcha_code);

    const response = await axios.post('http://localhost:8000/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data && response.data.message === "Login successful") {
      handleLogin();
      onLoginSuccess?.();
    } else {
      throw new Error(response.data?.message || 'Đăng nhập thất bại');
    }
  } catch (error) {
    const errorMessage = error.response?.data?.detail?.message || 
                        error.response?.data?.message || 
                        error.message || 
                        'Đăng nhập thất bại';
    alert(errorMessage);
    
    // Refresh captcha on login failure
    try {
      await axios.get("http://localhost:8000/refresh");
      setCaptchaUrl(`http://localhost:8000/captcha?ts=${Date.now()}`);
      setForm(prev => ({ ...prev, captcha_code: '' }));
    } catch (err) {
      console.error("Failed to refresh captcha", err);
    }
  } finally {
    setLoadingLogin(false);
  }
};

  const inputClasses = (name) => `
    w-full bg-white border-2 text-gray-800 placeholder-gray-400 
    rounded-xl px-4 py-3 pl-10
    transition-all duration-300 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-[#4680ef] focus:border-transparent
    ${focusedInput === name ? 'border-[#4680ef] shadow-lg shadow-blue-100' : 'border-gray-200 hover:border-gray-300'}
  `;

  return (
    step === "login" ? (
      <div className="flex h-full bg-gray-50">
        {/* Left side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-dot">
          <div className="w-[560px] p-8 rounded-2xl shadow-lg  bg-gradient-to-b from-[#ff5e5f] to-[#c6494a] transition-all duration-500 hover:shadow-xl">
            <h1 className="text-2xl font-bold text-center mb-8 text-white">
              ĐĂNG NHẬP HỆ THỐNG
              <div className="text-lg font-normal text-white mt-1">thuedientu.gdt.gov.vn</div>
            </h1>
            
            {selectedCompany && (
              <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                <div className="text-sm font-medium text-blue-800">{selectedCompany.name}</div>
                <div className="text-sm text-blue-600">MST: {selectedCompany.taxId}</div>
              </div>
            )}
            
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    className={inputClasses('username')}
                    placeholder="Tên đăng nhập"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    onFocus={() => setFocusedInput('username')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </div>

                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    className={inputClasses('password')}
                    placeholder="Mật khẩu"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </div>

                <div className="relative">
                  <FiShield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <div className="flex gap-3">
                    <input
                      className={inputClasses('captcha')}
                      placeholder="Mã xác nhận"
                      value={form.captcha_code}
                      onChange={(e) => setForm({ ...form, captcha_code: e.target.value })}
                      onFocus={() => setFocusedInput('captcha')}
                      onBlur={() => setFocusedInput(null)}
                    />
                    <div className="flex items-center gap-2 bg-gray-50 px-3 rounded-xl border-2 border-gray-200">
                      {captchaUrl ? (
                        <img
                          src={captchaUrl}
                          alt="captcha"
                          className="h-8"
                        />
                      ) : (
                        <div className="h-8 w-24 flex items-center justify-center text-gray-400 text-sm animate-pulse">
                          Đang tải...
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            setLoadingCaptcha(true);
                            await axios.get("http://localhost:8000/refresh");
                            setCaptchaUrl(`http://localhost:8000/captcha?ts=${Date.now()}`);
                          } catch (err) {
                            console.error("Captcha reload failed", err);
                          } finally {
                            setLoadingCaptcha(false);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                      >
                        {loadingCaptcha ? (
                          <Spinner size={4} />
                        ) : (
                          <FiRefreshCw className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#4680ef] focus:ring-[#4680ef] transition-colors"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-white">
                  Nhớ (tại máy) thông tin đăng nhập cho lần sau
                </label>
              </div>

              <div className="text-sm text-center text-yellow-600 bg-yellow-50 p-3 rounded-xl">
                Cảnh báo không lưu và thu thập TK thuế của bạn
              </div>

              <button
                type="submit"
                className="w-full bg-[#4680ef] text-white p-3 rounded-xl font-medium 
                         hover:bg-blue-600 active:bg-blue-700 
                         transition-all duration-300 ease-in-out
                         transform hover:-translate-y-0.5 active:translate-y-0
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
                         flex justify-center items-center gap-2 shadow-lg shadow"
                disabled={loadingLogin}
              >
                {loadingLogin ? <Spinner /> : "Đăng nhập"}
              </button>
            </form>
          </div>
        </div>

        {/* Right side - Information and Policy */}
        <div className="w-[600px] bg-white p-12 flex flex-col justify-center border-l border-gray-200">
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Hướng dẫn kê khai thuế điện tử</h2>
              <div className="space-y-4 text-gray-600">
                <p className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">1</span>
                  <span>Đăng nhập bằng tài khoản thuế điện tử của bạn</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">2</span>
                  <span>Chọn loại tờ khai thuế cần kê khai</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">3</span>
                  <span>Điền thông tin theo hướng dẫn và gửi tờ khai</span>
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Chính sách & Quy định</h2>
              <div className="space-y-3 text-gray-600">
                <p>• Bảo mật thông tin cá nhân và doanh nghiệp</p>
                <p>• Tuân thủ quy định của pháp luật về thuế</p>
                <p>• Lưu trữ và bảo quản chứng từ điện tử</p>
                <p>• Thời hạn nộp tờ khai và thanh toán thuế</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Hỗ trợ</h2>
              <div className="space-y-3 text-gray-600">
                <p>• Tổng đài hỗ trợ: 1900 xxxx</p>
                <p>• Email: support@thuedientu.gdt.gov.vn</p>
                <p>• Thời gian hỗ trợ: 8:00 - 17:30 (Thứ 2 - Thứ 6)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <RealTaxSearch />
    )
  );
}
