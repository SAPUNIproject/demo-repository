import { useState } from "react";
import CustomSelect from "../components/CustomSelect";
import "./Users.css";

export default function Users() {
    const [search, setSearch] = useState("");
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [users, setUsers] = useState([
        {
            id: 1,
            username: "admin",
            email: "admin@email.com",
            role: "ADMIN",
            createdAt: "2026-04-14",
        },
        {
            id: 2,
            username: "author1",
            email: "author1@email.com",
            role: "AUTHOR",
            createdAt: "2026-04-13",
        },
        {
            id: 3,
            username: "reviewer1",
            email: "reviewer1@email.com",
            role: "REVIEWER",
            createdAt: "2026-04-12",
        },
        {
            id: 4,
            username: "reader1",
            email: "reader1@email.com",
            role: "READER",
            createdAt: "2026-04-11",
        },
    ]);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createUsername, setCreateUsername] = useState("");
    const [createEmail, setCreateEmail] = useState("");
    const [createRole, setCreateRole] = useState("READER");
    const [createError, setCreateError] = useState("");

    const [showEditModal, setShowEditModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editUsername, setEditUsername] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editRole, setEditRole] = useState("READER");
    const [editError, setEditError] = useState("");

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    const [showResetModal, setShowResetModal] = useState(false);
    const [resetUserId, setResetUserId] = useState(null);
    const [resetPassword, setResetPassword] = useState("");
    const [resetConfirmPassword, setResetConfirmPassword] = useState("");
    const [resetError, setResetError] = useState("");
    const [resetSuccess, setResetSuccess] = useState("");

    const roleOptions = [
        { value: "ADMIN", label: "ADMIN" },
        { value: "AUTHOR", label: "AUTHOR" },
        { value: "REVIEWER", label: "REVIEWER" },
        { value: "READER", label: "READER" },
    ];

    const filteredUsers = users.filter(
        (user) =>
            user.username.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            user.role.toLowerCase().includes(search.toLowerCase())
    );

    const openCreateModal = () => {
        setCreateUsername("");
        setCreateEmail("");
        setCreateRole("READER");
        setCreateError("");
        setShowCreateModal(true);
    };

    const closeCreateModal = () => {
        setShowCreateModal(false);
        setCreateUsername("");
        setCreateEmail("");
        setCreateRole("READER");
        setCreateError("");
    };

    const handleCreateUser = () => {
        if (!createUsername.trim()) {
            setCreateError("Username is required.");
            return;
        }

        if (!createEmail.trim()) {
            setCreateError("Email is required.");
            return;
        }

        const newUser = {
            id: Date.now(),
            username: createUsername.trim(),
            email: createEmail.trim(),
            role: createRole,
            createdAt: new Date().toISOString().split("T")[0],
        };

        setUsers((prev) => [newUser, ...prev]);
        closeCreateModal();
    };

    const openEditModal = (user) => {
        setEditId(user.id);
        setEditUsername(user.username);
        setEditEmail(user.email);
        setEditRole(user.role);
        setEditError("");
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditId(null);
        setEditUsername("");
        setEditEmail("");
        setEditRole("READER");
        setEditError("");
    };

    const handleSaveEdit = () => {
        if (!editUsername.trim()) {
            setEditError("Username is required.");
            return;
        }

        if (!editEmail.trim()) {
            setEditError("Email is required.");
            return;
        }

        setUsers((prev) =>
            prev.map((user) =>
                user.id === editId
                    ? {
                        ...user,
                        username: editUsername.trim(),
                        email: editEmail.trim(),
                        role: editRole,
                    }
                    : user
            )
        );

        closeEditModal();
    };

    const openDeleteModal = (id) => {
        setSelectedUserId(id);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setSelectedUserId(null);
        setShowDeleteModal(false);
    };

    const handleDeleteUser = () => {
        setUsers((prev) => prev.filter((user) => user.id !== selectedUserId));
        closeDeleteModal();
    };

    const openResetModal = (id) => {
        setResetUserId(id);
        setResetPassword("");
        setResetConfirmPassword("");
        setResetError("");
        setResetSuccess("");
        setShowResetModal(true);
    };

    const closeResetModal = () => {
        setResetUserId(null);
        setResetPassword("");
        setResetConfirmPassword("");
        setResetError("");
        setResetSuccess("");
        setShowResetModal(false);
    };

    const handleResetPassword = () => {
        if (!resetPassword.trim()) {
            setResetError("New password is required.");
            return;
        }

        if (resetPassword.length < 8) {
            setResetError("Password must be at least 8 characters.");
            return;
        }

        if (resetPassword !== resetConfirmPassword) {
            setResetError("Passwords do not match.");
            return;
        }

        setResetError("");
        setResetSuccess("Password reset successfully.");

        setTimeout(() => {
            closeResetModal();
        }, 1200);
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
                        {filteredUsers.length > 0 ? (
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
                                            <button
                                                className="small-btn"
                                                onClick={() => openEditModal(user)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="small-btn reset-btn"
                                                onClick={() => openResetModal(user.id)}
                                            >
                                                Reset Password
                                            </button>
                                            <button
                                                className="small-btn delete"
                                                onClick={() => openDeleteModal(user.id)}
                                            >
                                                Delete
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
                            type="email"
                            className="modal-input"
                            placeholder="Email"
                            value={createEmail}
                            onChange={(e) => setCreateEmail(e.target.value)}
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

            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal users-modal">
                        <h3>Edit User</h3>
                        <p>Update user information.</p>

                        {editError && <div className="form-error">{editError}</div>}

                        <input
                            type="text"
                            className="modal-input"
                            placeholder="Username"
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                        />

                        <input
                            type="email"
                            className="modal-input"
                            placeholder="Email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                        />

                        <div className="select-spacing">
                            <CustomSelect
                                value={editRole}
                                onChange={setEditRole}
                                placeholder="Select role"
                                options={roleOptions}
                            />
                        </div>

                        <div className="modal-actions">
                            <button className="btn secondary" onClick={closeEditModal}>
                                Cancel
                            </button>
                            <button className="btn" onClick={handleSaveEdit}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Delete User</h3>
                        <p>Are you sure you want to delete this user?</p>

                        <div className="modal-actions">
                            <button className="btn secondary" onClick={closeDeleteModal}>
                                Cancel
                            </button>
                            <button className="btn danger" onClick={handleDeleteUser}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showResetModal && (
                <div className="modal-overlay">
                    <div className="modal users-modal">
                        <h3>Reset Password</h3>
                        <p>Set a new password for this user.</p>

                        {resetError && <div className="form-error">{resetError}</div>}
                        {resetSuccess && <div className="success-box">{resetSuccess}</div>}

                        <input
                            type="password"
                            className="modal-input"
                            placeholder="New password"
                            value={resetPassword}
                            onChange={(e) => setResetPassword(e.target.value)}
                        />

                        <input
                            type="password"
                            className="modal-input"
                            placeholder="Confirm new password"
                            value={resetConfirmPassword}
                            onChange={(e) => setResetConfirmPassword(e.target.value)}
                        />

                        <div className="modal-actions">
                            <button className="btn secondary" onClick={closeResetModal}>
                                Cancel
                            </button>
                            <button className="btn" onClick={handleResetPassword}>
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}