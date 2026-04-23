import { useEffect, useMemo, useState } from "react";
import {
    getUsers,
    createUser,
    deleteUser,
    changeUserRole,
} from "../../services/api";
import "./Users.css";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [username, setUsername] = useState("");
    const [role, setRole] = useState("READER");

    const [selectedUser, setSelectedUser] = useState(null);
    const [editRole, setEditRole] = useState("READER");

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
            setError(err.message);
        }
    };

    const handleCreateUser = async () => {
        try {
            const requesterUsername = localStorage.getItem("username");

            const newUser = await createUser(requesterUsername, {
                username,
                password: "Admin@123",
                role,
            });

            setUsers((prev) => [newUser, ...prev]);
            setShowCreateModal(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            const requesterUsername = localStorage.getItem("username");

            await deleteUser(selectedUser.id, requesterUsername);

            setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
            setShowDeleteModal(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEditUser = async () => {
        try {
            const requesterUsername = localStorage.getItem("username");

            await changeUserRole(selectedUser.id, editRole, requesterUsername);

            setUsers((prev) =>
                prev.map((u) =>
                    u.id === selectedUser.id ? { ...u, role: editRole } : u
                )
            );

            setShowEditModal(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter((u) =>
            u.username.toLowerCase().includes(search.toLowerCase())
        );
    }, [users, search]);

    const getRoleClass = (r) => {
        const role = (r || "").toLowerCase();
        if (role === "admin") return "role-badge admin";
        if (role === "author") return "role-badge author";
        if (role === "reviewer") return "role-badge reviewer";
        return "role-badge reader";
    };

    return (
        <div className="users-page">
            <div className="users-header">
                <div>
                    <h2>Users</h2>
                    <p>Manage system users</p>
                </div>

                <button className="btn" onClick={() => setShowCreateModal(true)}>
                    + Add User
                </button>
            </div>

            <input
                className="users-search"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="users-table-wrapper">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Role</th>
                            <th style={{ textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td>{user.username}</td>

                                <td>
                                    <span className={getRoleClass(user.role)}>
                                        {user.role}
                                    </span>
                                </td>

                                <td style={{ textAlign: "right" }}>
                                    <div className="table-actions">
                                        <button
                                            className="small-btn view"
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setShowViewModal(true);
                                            }}
                                        >
                                            View
                                        </button>

                                        <button
                                            className="small-btn edit"
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setEditRole(user.role);
                                                setShowEditModal(true);
                                            }}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="small-btn delete"
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setShowDeleteModal(true);
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* VIEW */}
            {showViewModal && selectedUser && (
                <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
                    <div className="modal view-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>User Details</h3>

                        <div className="view-row">
                            <b>ID</b> <span>{selectedUser.id}</span>
                        </div>

                        <div className="view-row">
                            <b>Username</b> <span>{selectedUser.username}</span>
                        </div>

                        <div className="view-row">
                            <b>Role</b>
                            <span className={getRoleClass(selectedUser.role)}>
                                {selectedUser.role}
                            </span>
                        </div>

                        <div className="modal-actions">
                            <button className="btn secondary" onClick={() => setShowViewModal(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT */}
            {showEditModal && selectedUser && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal users-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Edit User</h3>

                        <input className="modal-input" value={selectedUser.username} disabled />

                        <select
                            className="modal-input"
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                        >
                            <option value="ADMIN">ADMIN</option>
                            <option value="AUTHOR">AUTHOR</option>
                            <option value="REVIEWER">REVIEWER</option>
                            <option value="READER">READER</option>
                        </select>

                        <div className="modal-actions">
                            <button className="btn" onClick={handleEditUser}>
                                Save
                            </button>

                            <button className="btn secondary" onClick={() => setShowEditModal(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE */}
            {showDeleteModal && selectedUser && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal delete-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Delete User</h3>

                        <p>Delete <b>{selectedUser.username}</b>?</p>

                        <div className="delete-warning">
                            This action cannot be undone.
                        </div>

                        <div className="delete-actions">
                            <button className="btn delete-confirm" onClick={handleDeleteConfirm}>
                                Delete
                            </button>

                            <button className="btn secondary" onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}