import React, { useEffect, useState } from "react";

const LoginForm = () => {
  const [captchaUrl, setCaptchaUrl] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [form, setForm] = useState({ username: "", password: "", captcha: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/captcha")
      .then(async (res) => {
        if (res.ok) {
          console.log(
            "Response headers:",
            Object.fromEntries(res.headers.entries())
          );
          const blob = await res.blob();
          const sessionId = res.headers.get("x-session-id");
          setSessionId(sessionId);
          setCaptchaUrl(URL.createObjectURL(blob));
          console.log("Session ID:", sessionId);
        } else {
          setMessage("Không thể tải captcha.");
        }
      })
      .catch((error) => {
        console.error("Error fetching captcha:", error);
        setMessage("Có lỗi khi tải captcha.");
      });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
      username: form.username, 
      password: form.password,
      captcha: form.captcha,
      }),
    });

    // Make sure you're only parsing the response once
    const data = await response.json();

    if (data.success) {
      console.log("Login successful:", data.message);
      alert(data.message);
    } else {
      console.error("Login failed:", data.message);
      alert(data.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md space-y-4 w-full max-w-md"
      >
        <h2 className="text-xl font-semibold">Đăng nhập thuế điện tử</h2>
        <input
          type="text"
          placeholder="Mã số thuế"
          className="input"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          className="input"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <div className="flex items-center space-x-2">
          {captchaUrl && (
            <img src={captchaUrl} alt="captcha" className="h-12 border" />
          )}
          <input
            type="text"
            placeholder="Mã captcha"
            className="input flex-1"
            value={form.captcha}
            onChange={(e) => setForm({ ...form, captcha: e.target.value })}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Đăng nhập
        </button>
        {message && (
          <div className="text-center text-sm text-red-600 mt-2">{message}</div>
        )}
      </form>
    </div>
  );
};

export default LoginForm;
