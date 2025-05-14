import React, { useEffect, useState } from "react";
import axios from "axios";

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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
        {step === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 text-center">
              Đăng nhập
            </h2>
            <input
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tên đăng nhập"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <div className="flex items-center space-x-4">
              <input
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mã captcha"
                value={form.captcha_code}
                onChange={(e) =>
                  setForm({ ...form, captcha_code: e.target.value })
                }
              />
              {captchaUrl ? (
                <div className="flex items-center space-x-2">
                  <img
                    src={captchaUrl}
                    alt="captcha"
                    className="h-12 border"
                  />
                  <button
                    type="button"
                    disabled={loadingCaptcha}
                    onClick={async () => {
                      try {
                        setLoadingCaptcha(true);
                        await axios.get("http://localhost:8000/refresh");
                        setCaptchaUrl(
                          `http://localhost:8000/captcha?ts=${Date.now()}`
                        );
                      } catch (err) {
                        console.error("Captcha reload failed", err);
                      } finally {
                        setLoadingCaptcha(false);
                      }
                    }}
                    className={`p-1 hover:opacity-80 transition-opacity ${
                      loadingCaptcha ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    }`}
                    title="Làm mới mã captcha"
                  >
                    {loadingCaptcha ? (
                      <Spinner size={4} />
                    ) : (
                      <img
                        src="https://thuedientu.gdt.gov.vn/etaxnnt/static/images/bab/lam_moi.png"
                        alt="Làm mới"
                        width="18"
                        height="16"
                      />
                    )}
                  </button>
                </div>
              ) : (
                <div className="h-12 w-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                  Đang tải captcha...
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center"
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
