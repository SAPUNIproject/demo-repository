import "./Help.css";

export default function Help() {
    return (
        <div className="help-page">
            <div className="help-card">
                <h2>Help Center</h2>
                <p className="help-subtitle">
                    Find answers and learn how to use the system.
                </p>

                <div className="help-section">
                    <h3>📄 Documents</h3>
                    <p>
                        You can upload, create, edit and manage documents. Each document
                        supports versioning and approval workflows.
                    </p>
                </div>

                <div className="help-section">
                    <h3>🔄 Versions</h3>
                    <p>
                        Every document can have multiple versions. You can approve, reject,
                        restore or compare them.
                    </p>
                </div>

                <div className="help-section">
                    <h3>👤 Users</h3>
                    <p>
                        Admins can manage users, assign roles and reset passwords.
                    </p>
                </div>

                <div className="help-section">
                    <h3>⚙️ Settings</h3>
                    <p>
                        Customize your profile and system settings. Admins have access to
                        advanced options.
                    </p>
                </div>

                <div className="help-section contact">
                    <h3>📩 Need more help?</h3>
                    <p>Email: support@yourapp.com</p>
                </div>
            </div>
        </div>
    );
}