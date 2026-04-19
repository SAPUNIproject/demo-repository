import { useEffect, useMemo, useState } from "react";
import { getUsers, createUser } from "../../services/api";
import "./Users.css";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [username, setUsername] = useState("");
    const [role, setRole] = useState("READER");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const requesterUsername = localStorage.getItem("username");
            const data = await getUsers(requesterUsername);
            setUsers(data);
        } catch (err) {
            setError(err.message || "Failed to load users");
        }
    };

    const handleCreateUser = async () => {
        try {
            setError("");
            setSuccess("");

            if (!username.trim()) {
                setError("Username is required");
                return;
            }

            const requesterUsername = localStorage.getItem("username");

            const newUser = await createUser(requesterUsername, {
                username: username.trim(),
                password: "Admin@123",
                role,
            });

            setUsers((prev) => [newUser, ...prev]);
            setSuccess("User created successfully");
            setUsername("");
            setRole("READER");

            setTimeout(() => {
                setShowCreateModal(false);
                setSuccess("");
            }, 800);
        } catch (err) {
            setError(err.message || "Failed to create user");
        }
    };

    const handleView = (user) => {
        alert(`Username: ${user.username}\nRole: ${user.role}`);
    };

    const handleEdit = (user) => {
        alert(`Edit for ${user.username} is not connected to backend yet.`);
    };

    const handleDelete = (user) => {
        const confirmed = window.confirm(`Delete ${user.username}?`);
        if (confirmed) {
            alert(`Delete for ${user.username} is not connected to backend yet.`);
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter((user) =>
            user.username.toLowerCase().includes(search.toLowerCase())
        );
    }, [users, search]);

    const getRoleClass = (roleValue) => {
        const normalized = String(roleValue || "").toLowerCase();

        if (normalized === "admin") return "role-badge admin";
        if (normalized === "author") return "role-badge author";
        if (normalized === "reviewer") return "role-badge reviewer";
        return "role-badge reader";
    };

    return (
        <div className="users-page">
            <div className="users-header">
                <div>
                    <h2>Users</h2>
                    <p>Manage system users and roles</p>
                </div>

                <button className="btn" onClick={() => setShowCreateModal(true)}>
                    + Add User
                </button>
            </div>

            <div className="users-toolbar">
                <input
                    type="text"
                    className="users-search"
                    placeholder="Search by username..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="users-table-wrapper">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.username}</td>
                                    <td>
                                        <span className={getRoleClass(user.role)}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button
                                                className="small-btn"
                                                onClick={() => handleView(user)}
                                            >
                                                View
                                            </button>

                                            <button
                                                className="small-btn"
                                                onClick={() => handleEdit(user)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="small-btn delete"
                                                onClick={() => handleDelete(user)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="empty-row">
                                    No users found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showCreateModal && (
                <div
                    className="modal-overlay"
                    onClick={() => {
                        setShowCreateModal(false);
                        setError("");
                        setSuccess("");
                    }}
                >
                    <div className="modal users-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Create User</h3>
                        <p>Add a new user to the system</p>

                        {error && <div className="form-error">{error}</div>}
                        {success && <div className="success-box">{success}</div>}

                        <input
                            type="text"
                            className="modal-input"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />

                        <select
                            className="modal-input select-spacing"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="ADMIN">ADMIN</option>
                            <option value="AUTHOR">AUTHOR</option>
                            <option value="REVIEWER">REVIEWER</option>
                            <option value="READER">READER</option>
                        </select>

                        <div className="modal-actions">
                            <button className="btn" onClick={handleCreateUser}>
                                Create
                            </button>
                            <button
                                className="btn secondary"
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setError("");
                                    setSuccess("");
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}