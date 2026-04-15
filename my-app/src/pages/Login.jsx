import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const nav = useNavigate();

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'"\\|,.<>/?]).{8,}$/;

  // Сложи за създаване на акоунт
  const handleLogin = () => {
    if (!username) {
      setError("Username cannot be empty");
      return;
    }

    if (!password) {
      setError("Password cannot be empty");
      return;
    }

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

          <button className="loginButton" onClick={handleLogin}>
            Login
          </button>
          
        </div>
      </div>
    </div>
  );
}