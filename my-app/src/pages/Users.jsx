<<<<<<< Updated upstream:my-app/src/pages/Users.jsx
import { useState } from "react";
import CustomSelect from "../components/CustomSelect";
=======
import { useEffect, useState } from "react";
import CustomSelect from "../../components/CustomSelect";
>>>>>>> Stashed changes:my-app/src/pages/layout/Users.jsx
import "./Users.css";

export default function Users() {
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");

    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createUsername, setCreateUsername] = useState("");
    const [createPassword, setCreatePassword] = useState("");
    const [createRole, setCreateRole] = useState("READER");
    const [createError, setCreateError] = useState("");

    const currentUsername = localStorage.getItem("username") || "";

    const roleOptions = [
        { value: "ADMIN", label: "ADMIN" },
        { value: "AUTHOR", label: "AUTHOR" },
        { value: "REVIEWER", label: "REVIEWER" },
        { value: "READER", label: "READER" },
    ];

    const loadUsers = async () => {
        try {
            setLoading(true);
            setPageError("");

            const response = await fetch(
                `http://localhost:8080/api/users?requesterUsername=${encodeURIComponent(currentUsername)}`
            );

            const data = await response.json();

            if (!response.ok) {
                setPageError(data.message || "Failed to load users.");
                setUsers([]);
                return;
            }

            const formatted = data.map((user) => ({
                id: user.id,
                username: user.username,
                email: "-",
                role: user.role,
                createdAt: "-",
            }));

            setUsers(formatted);
        } catch (error) {
            setPageError("Cannot connect to server.");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUsername) {
            loadUsers();
        } else {
            setLoading(false);
            setPageError("No logged in user found.");
        }
    }, []);

    const filteredUsers = users.filter(
        (user) =>
            user.username.toLowerCase().includes(search.toLowerCase()) ||
            user.role.toLowerCase().includes(search.toLowerCase())
    );

    const openCreateModal = () => {
        setCreateUsername("");
        setCreatePassword("");
        setCreateRole("READER");
        setCreateError("");
        setShowCreateModal(true);
    };

    const closeCreateModal = () => {
        setShowCreateModal(false);
        setCreateUsername("");
        setCreatePassword("");
        setCreateRole("READER");
        setCreateError("");
    };

    const handleCreateUser = async () => {
        if (!createUsername.trim()) {
            setCreateError("Username is required.");
            return;
        }

        if (!createPassword.trim()) {
            setCreateError("Password is required.");
            return;
        }

        if (createPassword.length < 4) {
            setCreateError("Password must be at least 4 characters.");
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8080/api/users?requesterUsername=${encodeURIComponent(currentUsername)}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: createUsername.trim(),
                        password: createPassword,
                        role: createRole,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setCreateError(data.message || "Failed to create user.");
                return;
            }

            closeCreateModal();
            loadUsers();
        } catch (error) {
            setCreateError("Cannot connect to server.");
        }
    };

    const openViewModal = (user) => {
        setSelectedUser(user);
        setShowViewModal(true);
    };

    const closeViewModal = () => {
        setSelectedUser(null);
        setShowViewModal(false);
    };

    return (
        <div className="users-page">
            <div className="users-header">
                <div>
                    <h2>Users</h2>
                    <p>Manage users and roles in the system.</p>
                </div>

                <button className="btn" onClick={openCreateModal}>
                    Create User
                </button>
            </div>

            <div className="users-toolbar">
                <input
                    type="text"
                    className="users-search"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {pageError && <div className="form-error">{pageError}</div>}

            <div className="users-table-wrapper">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="empty-row">
                                    Loading users...
                                </td>
                            </tr>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>{user.createdAt}</td>
                                    <td>
                                        <div className="table-actions">
                                            <button
                                                className="small-btn"
                                                onClick={() => openViewModal(user)}
                                            >
                                                View
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="empty-row">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showViewModal && selectedUser && (
                <div className="modal-overlay">
                    <div className="modal users-modal view-modal">
                        <h3>User Details</h3>
                        <p>View user information.</p>

                        <div className="view-details">
                            <div className="view-row">
                                <span>Username</span>
                                <strong>{selectedUser.username}</strong>
                            </div>

                            <div className="view-row">
                                <span>Email</span>
                                <strong>{selectedUser.email}</strong>
                            </div>

                            <div className="view-row">
                                <span>Role</span>
                                <strong>{selectedUser.role}</strong>
                            </div>

                            <div className="view-row">
                                <span>Created At</span>
                                <strong>{selectedUser.createdAt}</strong>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn secondary" onClick={closeViewModal}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal users-modal">
                        <h3>Create User</h3>
                        <p>Add a new user to the system.</p>

                        {createError && <div className="form-error">{createError}</div>}

                        <input
                            type="text"
                            className="modal-input"
                            placeholder="Username"
                            value={createUsername}
                            onChange={(e) => setCreateUsername(e.target.value)}
                        />

                        <input
                            type="password"
                            className="modal-input"
                            placeholder="Password"
                            value={createPassword}
                            onChange={(e) => setCreatePassword(e.target.value)}
                        />

                        <div className="select-spacing">
                            <CustomSelect
                                value={createRole}
                                onChange={setCreateRole}
                                placeholder="Select role"
                                options={roleOptions}
                            />
                        </div>

                        <div className="modal-actions">
                            <button className="btn secondary" onClick={closeCreateModal}>
                                Cancel
                            </button>
                            <button className="btn" onClick={handleCreateUser}>
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}