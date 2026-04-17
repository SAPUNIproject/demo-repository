import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();

<<<<<<< Updated upstream:my-app/src/pages/Login.jsx
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'"\\|,.<>/?]).{8,}$/;

  // Сложи за създаване на акоунт
  const handleLogin = () => {
    if (!username) {
=======
  const handleLogin = async () => {
    if (!username.trim()) {
>>>>>>> Stashed changes:my-app/src/pages/out/Login.jsx
      setError("Username cannot be empty");
      return;
    }

    if (!password.trim()) {
      setError("Password cannot be empty");
      return;
    }

<<<<<<< Updated upstream:my-app/src/pages/Login.jsx
    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 8 chars, include uppercase, number and symbol"
      );
      return;
    }

    if (username !== "admin" || password !== "Admin@123") {
      setError("Invalid username or password");
      return;
    }

    // 🔥 ВРЕМЕННО (role)
    localStorage.setItem("role", "ADMIN");

    setError("");
    nav("/dashboard");
=======
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.username);

      nav("/dashboard");
    } catch (err) {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
>>>>>>> Stashed changes:my-app/src/pages/out/Login.jsx
  };

  return (
    <div className="login">
      <div className="login-container">
        <div className={`login-card ${error ? "shake" : ""}`}>
          <h2>Login</h2>

          {error && <div className="error">{error}</div>}

          <div className="field">
            <input
              className="input"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label>Username</label>
          </div>

          <div className="field">
            <input
              type="password"
              className="input"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label>Password</label>
          </div>

          <button className="loginButton" onClick={handleLogin} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          
        </div>
      </div>
    </div>
  );
}