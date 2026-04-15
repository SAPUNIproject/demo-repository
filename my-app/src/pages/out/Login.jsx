import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const nav = useNavigate();

  const handleLogin = () => {
    if (!username) {
      setError("Username cannot be empty");
      return;
    }

    if (!password) {
      setError("Password cannot be empty");
      return;
    }

    if (username !== "admin" || password !== "Admin@123") {
      setError("Invalid username or password");
      return;
    }

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
              type="text"
              placeholder=" "
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label>Username</label>
          </div>

          <div className="field">
            <input
              type="password"
              className="input"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label>Password</label>
          </div>

          <button className="loginButton" onClick={handleLogin}>
            Login
          </button>

          <p className="login-footer">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
          <p className="signup-footer">
            Do you need <Link to="/help">Help</Link>?
          </p>
        </div>
      </div>
    </div>
  );
}