import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Documents.css";

export default function Documents() {
  const [search, setSearch] = useState("");
  const [documents, setDocuments] = useState([
    {
      id: 1,
      title: "Project Spec",
      description: "Main project specification document",
      version: "v3",
      status: "Approved",
      author: "admin",
      updatedAt: "2026-04-14",
    },
    {
      id: 2,
      title: "API Documentation",
      description: "Backend endpoints and usage notes",
      version: "v2",
      status: "Pending Review",
      author: "author1",
      updatedAt: "2026-04-13",
    },
    {
      id: 3,
      title: "Release Notes",
      description: "Latest release summary",
      version: "v1",
      status: "Draft",
      author: "author1",
      updatedAt: "2026-04-12",
    },
  ]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [createError, setCreateError] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editError, setEditError] = useState("");

  const fileInputRef = useRef(null);

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== selectedId));
    setShowConfirm(false);
    setSelectedId(null);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setSelectedId(null);
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
    setCreateError("");
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setNewTitle("");
    setNewDescription("");
    setCreateError("");
  };

  const handleCreateDocument = () => {
    if (!newTitle.trim()) {
      setCreateError("Title is required.");
      return;
    }

    const newDocument = {
      id: Date.now(),
      title: newTitle.trim(),
      description: newDescription.trim() || "No description",
      version: "v1",
      status: "Draft",
      author: "admin",
      updatedAt: new Date().toISOString().split("T")[0],
    };

    setDocuments((prev) => [newDocument, ...prev]);
    closeCreateModal();
  };

  const openEditModal = (doc) => {
    setEditId(doc.id);
    setEditTitle(doc.title);
    setEditDescription(doc.description);
    setEditError("");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditId(null);
    setEditTitle("");
    setEditDescription("");
    setEditError("");
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) {
      setEditError("Title is required.");
      return;
    }

    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === editId
          ? {
            ...doc,
            title: editTitle.trim(),
            description: editDescription.trim() || "No description",
            updatedAt: new Date().toISOString().split("T")[0],
          }
          : doc
      )
    );

    closeEditModal();
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const newDocument = {
      id: Date.now(),
      title: file.name,
      description: "Uploaded document",
      version: "v1",
      status: "Draft",
      author: "admin",
      updatedAt: new Date().toISOString().split("T")[0],
    };

    setDocuments((prev) => [newDocument, ...prev]);
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="documents-page">
      <div className="documents-header">
        <div>
          <h2>Documents</h2>
          <p>Manage all documents in your versioning system.</p>
        </div>

        <div className="documents-actions">
          <button className="btn" onClick={handleUploadClick}>
            Upload Document
          </button>
          <button className="btn secondary" onClick={openCreateModal}>
            Create Document
          </button>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden-input"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="documents-toolbar">
        <input
          type="text"
          placeholder="Search documents..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="documents-table-wrapper">
        <table className="documents-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Version</th>
              <th>Status</th>
              <th>Author</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.title}</td>
                  <td>{doc.description}</td>
                  <td>{doc.version}</td>
                  <td>
                    <span
                      className={`status-badge ${doc.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td>{doc.author}</td>
                  <td>{doc.updatedAt}</td>
                  <td>
                    <div className="table-actions">
                      <Link
                        to={`/documents/${doc.id}`}
                        className="small-btn link-btn"
                      >
                        View
                      </Link>
                      <button
                        className="small-btn"
                        onClick={() => openEditModal(doc)}
                      >
                        Edit
                      </button>
                      <button
                        className="small-btn delete"
                        onClick={() => handleDeleteClick(doc.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-row">
                  No documents found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Document</h3>
            <p>Are you sure you want to delete this document?</p>

            <div className="modal-actions">
              <button className="btn secondary" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="btn danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal create-modal">
            <h3>Create Document</h3>
            <p>Add a new document to the system.</p>

            {createError && <div className="create-error">{createError}</div>}

            <input
              type="text"
              className="modal-input"
              placeholder="Document title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />

            <textarea
              className="modal-textarea"
              placeholder="Document description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />

            <div className="modal-actions">
              <button className="btn secondary" onClick={closeCreateModal}>
                Cancel
              </button>
              <button className="btn" onClick={handleCreateDocument}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal create-modal">
            <h3>Edit Document</h3>
            <p>Update document information.</p>

            {editError && <div className="create-error">{editError}</div>}

            <input
              type="text"
              className="modal-input"
              placeholder="Document title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />

            <textarea
              className="modal-textarea"
              placeholder="Document description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />

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
    </div>
  );
}