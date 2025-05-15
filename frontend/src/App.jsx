import React, { useEffect, useState } from "react";
import axios from "axios";
import logo from './assets/logo.jpg';

function Spinner({ size = 5 }) {
  return (
    <div
      className={`w-${size} h-${size} border-2 border-blue-500 border-t-transparent rounded-full animate-spin`}
    />
  );
}

function App() {
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
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [tableData, setTableData] = useState([]);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoadingLogin(true);
    try {
      await axios.post(
        "http://localhost:8000/login",
        new URLSearchParams(form),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      setStep("search");
    } catch (err) {
      console.error("Login failed", err);
      alert("Đăng nhập thất bại. Vui lòng kiểm tra thông tin.");
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleSearch = async () => {
    setLoadingSearch(true);
    try {
      const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const [year, month, day] = dateStr.split("-");
        return `${day}/${month}/${year}`;
      };

      const formattedDates = {
        from_date_input: formatDate(dates.from),
        to_date_input: formatDate(dates.to),
      };

      await axios.post(
        "http://localhost:8000/search",
        new URLSearchParams(formattedDates),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      const res = await axios.get("http://localhost:8000/display");
      setTableData(res.data.table);
    } catch (err) {
      console.error("Search failed", err.response?.data || err.message);
      alert("Tra cứu thất bại.");
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #fff 100%)' }}>
      <div className="bg-white rounded-2xl shadow-lg p-16 max-w-2xl w-full border-t-8 border-blue-800">
        {step === "login" && (
          <form onSubmit={handleLogin} className="space-y-6">
            <img src={logo} alt="BizNext Logo" className="mx-auto mb-4 w-44 drop-shadow-lg" />
            <h2 className="text-3xl font-bold text-blue-800 text-center tracking-wide mb-2">Đăng nhập hệ thống</h2>
            <p className="text-center text-gray-400 mb-6">Vui lòng nhập thông tin để tiếp tục</p>
            <input
              className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 text-blue-900 bg-white transition-all"
              placeholder="Tên đăng nhập"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <input
              type="password"
              className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 text-blue-900 bg-white transition-all"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <div className="flex w-full">
              <input
                className="flex-1 p-3 border border-blue-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 text-blue-900 bg-white transition-all"
                placeholder="Mã captcha"
                value={form.captcha_code}
                onChange={(e) => setForm({ ...form, captcha_code: e.target.value })}
                style={{ height: '56px' }}
              />
              {captchaUrl ? (
                <img
                  src={captchaUrl}
                  alt="captcha"
                  className="h-14 w-48 border-t border-b border-blue-200 bg-white object-contain"
                  style={{ height: '56px', borderTopRightRadius: 0, borderBottomRightRadius: 0, borderLeft: 'none' }}
                />
              ) : (
                <div className="h-14 w-48 border-t border-b border-blue-200 bg-gray-100 flex items-center justify-center text-gray-400 text-sm animate-pulse" style={{ height: '56px', borderTopRightRadius: 0, borderBottomRightRadius: 0, borderLeft: 'none' }}>
                  Đang tải captcha...
                </div>
              )}
              <button
                type="button"
                disabled={loadingCaptcha}
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
                className={`p-0 w-14 h-14 border border-blue-200 border-l-0 rounded-r-lg bg-white hover:bg-blue-50 transition-colors shadow-sm flex items-center justify-center ${loadingCaptcha ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                title="Làm mới mã captcha"
                style={{ height: '56px' }}
              >
                {loadingCaptcha ? (
                  <Spinner size={4} />
                ) : (
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M2 12a10 10 0 1 1 4.93 8.36" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="2 17 2 12 7 12" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-800 text-white p-3 rounded-lg font-semibold text-lg shadow hover:bg-blue-600 transition-all flex justify-center items-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loadingLogin}
            >
              {loadingLogin ? <Spinner /> : "Đăng nhập"}
            </button>
          </form>
        )}

        {step === "search" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 text-center">
              Tra cứu tờ khai
            </h2>
            <input
              type="date"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={dates.from}
              onChange={(e) => setDates({ ...dates, from: e.target.value })}
            />
            <input
              type="date"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={dates.to}
              onChange={(e) => setDates({ ...dates, to: e.target.value })}
            />
            <button
              onClick={handleSearch}
              disabled={loadingSearch}
              className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors flex justify-center items-center"
            >
              {loadingSearch ? <Spinner /> : "Tra cứu"}
            </button>
          </div>
        )}

        {tableData.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Kết quả tra cứu
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 text-sm text-gray-700">
                <thead className="bg-gray-50">
                  <tr>
                    {tableData[0].map((header, idx) => (
                      <th
                        key={idx}
                        className="px-4 py-3 border-b text-left font-medium text-gray-800"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b hover:bg-gray-50">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-3 border-b">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
