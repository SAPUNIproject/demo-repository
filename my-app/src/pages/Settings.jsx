import { useState } from "react";
import "./Settings.css";
import CustomSelect from "../components/CustomSelect";

export default function Settings() {
    const role = localStorage.getItem("role") || "READER";

    const [username, setUsername] = useState("admin");
    const [email, setEmail] = useState("admin@email.com");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const [allowUserCreation, setAllowUserCreation] = useState("yes");
    const [defaultDocumentStatus, setDefaultDocumentStatus] = useState("draft");
    const [auditLogging, setAuditLogging] = useState("enabled");

    const handleSave = () => {
        setMessage("Settings updated successfully!");
        setTimeout(() => setMessage(""), 3000);
    };

    return (
        <div className="settings-page">
            <div className="settings-card">
                <h2>Settings</h2>
                <p>Manage your account settings.</p>

                {message && <div className="success-msg">{message}</div>}

                <div className="settings-group">
                    <label>Username</label>
                    <input
                        className="settings-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="settings-group">
                    <label>Email</label>
                    <input
                        className="settings-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="settings-group">
                    <label>New Password</label>
                    <input
                        type="password"
                        className="settings-input"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {role === "ADMIN" && (
                    <div className="admin-settings">
                        <h3>Admin Settings</h3>

                        <div className="settings-group">
                            <label>Allow user creation</label>
                            <CustomSelect
                                value={allowUserCreation}
                                onChange={setAllowUserCreation}
                                placeholder="Select option"
                                options={[
                                    { value: "yes", label: "Yes" },
                                    { value: "no", label: "No" },
                                ]}
                            />
                        </div>

                        <div className="settings-group">
                            <label>Default document status</label>
                            <CustomSelect
                                value={defaultDocumentStatus}
                                onChange={setDefaultDocumentStatus}
                                placeholder="Select document status"
                                options={[
                                    { value: "draft", label: "Draft" },
                                    { value: "pending_review", label: "Pending Review" },
                                    { value: "approved", label: "Approved" },
                                ]}
                            />
                        </div>

                        <div className="settings-group">
                            <label>Audit logging</label>
                            <CustomSelect
                                value={auditLogging}
                                onChange={setAuditLogging}
                                placeholder="Select audit logging"
                                options={[
                                    { value: "enabled", label: "Enabled" },
                                    { value: "disabled", label: "Disabled" },
                                ]}
                            />
                        </div>
                    </div>
                )}

                <button className="settings-btn" onClick={handleSave}>
                    Save Changes
                </button>
            </div>
        </div>
    );
}