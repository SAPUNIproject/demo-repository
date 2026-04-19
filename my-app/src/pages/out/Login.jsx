import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/api";
import "./Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const nav = useNavigate();

  const handleLogin = async () => {
    try {
      setError("");

      if (!username.trim()) {
        setError("Username is required");
        return;
      }

      if (!password.trim()) {
        setError("Password is required");
        return;
      }

      const data = await loginUser(username, password);

      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);

      nav("/dashboard");
    } catch (err) {
      setError(err.message);
    }
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
            Need help? <Link to="/help">Help</Link>
          </p>
        </div>
      </div>
    </div>
  );
}