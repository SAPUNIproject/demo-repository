import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/api";
import "./SignUp.css";

export default function SignUp() {
    const nav = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("READER");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const passwordRegex =
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'"\\|,.<>/?]).{8,}$/;

    const handleSignUp = async () => {
        if (!username.trim()) {
            setError("Username cannot be empty");
            return;
        }

        if (!email.trim()) {
            setError("Email cannot be empty");
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

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const data = await registerUser(username.trim(), email.trim(), password, role);

            // Същият формат като login — пазим го, за да могат page-ите
            // да четат localStorage като преди.
            localStorage.setItem("user", JSON.stringify(data));
            localStorage.setItem("username", data.username);
            localStorage.setItem("role", data.role);

            setSuccess("Account created successfully!");

            setTimeout(() => {
                nav("/dashboard");
            }, 800);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="signup">
            <div className="signup-container">
                <div className={`signup-card ${error ? "shake" : ""}`}>
                    <h2>Sign Up</h2>
                    <p className="signup-subtitle">Create your account</p>

                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}

                    <div className="field">
                        <input
                            className="input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <label>Username</label>
                    </div>

                    <div className="field">
                        <input
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <label>Email</label>
                    </div>

                    <div className="field">
                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <label>Password</label>
                    </div>

                    <div className="field">
                        <input
                            type="password"
                            className="input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <label>Confirm Password</label>
                    </div>

                    <div className="role-group">
                        <label className="role-label">Role</label>
                        <select
                            className="role-select"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="READER">READER</option>
                            <option value="AUTHOR">AUTHOR</option>
                            <option value="REVIEWER">REVIEWER</option>
                        </select>
                    </div>

                    <button
                        className="button"
                        onClick={handleSignUp}
                        disabled={submitting}
                    >
                        {submitting ? "Creating..." : "Sign Up"}
                    </button>

                    <p className="signup-footer">
                        Already have an account? <Link to="/">Login</Link>
                    </p>
                    <p className="signup-footer">
                        Do you need <Link to="/help">Help</Link>?
                    </p>
                </div>
            </div>
        </div>
    );
}
