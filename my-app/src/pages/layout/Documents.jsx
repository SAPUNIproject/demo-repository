import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDocuments, createDocument } from "../../services/api";
import "./Documents.css";

export default function Documents() {
  const nav = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const requesterUsername = localStorage.getItem("username");
      const data = await getDocuments(requesterUsername);
      setDocuments(data);
    } catch (err) {
      setError(err.message || "Failed to load documents");
    }
  };

  const handleCreateDocument = async () => {
    try {
      setError("");

      if (!title.trim()) {
        setError("Title is required");
        return;
      }

      const requesterUsername = localStorage.getItem("username");

      const newDocument = await createDocument(requesterUsername, {
        title: title.trim(),
        description: description.trim(),
      });

      setDocuments((prev) => [newDocument, ...prev]);
      setTitle("");
      setDescription("");
      setShowCreateModal(false);
    } catch (err) {
      setError(err.message || "Failed to create document");
    }
  };

  const handleView = (document) => {
    nav(`/documents/${document.id}`);
  };

  const handleEdit = (document) => {
    alert(`Edit for "${document.title}" is not connected to backend yet.`);
  };

  const handleDelete = (document) => {
    const confirmed = window.confirm(`Delete "${document.title}"?`);
    if (confirmed) {
      alert(`Delete for "${document.title}" is not connected to backend yet.`);
    }
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) =>
      String(document.title || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [documents, search]);

  const getStatusClass = (statusValue) => {
    const normalized = String(statusValue || "").toLowerCase();

    if (normalized === "approved") return "status-badge approved";
    if (
      normalized === "pending review" ||
      normalized === "pending-review" ||
      normalized === "review"
    ) {
      return "status-badge pending-review";
    }
    return "status-badge draft";
  };

  return (
    <div className="documents-page">
      <div className="documents-header">
        <div>
          <h2>Documents</h2>
          <p>Manage system documents and versions</p>
        </div>

        <div className="documents-actions">
          <button className="btn" onClick={() => setShowCreateModal(true)}>
            + New Document
          </button>
        </div>
      </div>

      <div className="documents-toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="Search by title..."
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
              filteredDocuments.map((document) => (
                <tr key={document.id}>
                  <td>{document.title}</td>
                  <td>{document.description}</td>
                  <td>{document.version}</td>
                  <td>
                    <span className={getStatusClass(document.status)}>
                      {document.status}
                    </span>
                  </td>
                  <td>{document.author}</td>
                  <td>{document.updatedAt}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="small-btn"
                        onClick={() => handleView(document)}
                      >
                        View
                      </button>

                      <button
                        className="small-btn"
                        onClick={() => handleEdit(document)}
                      >
                        Edit
                      </button>

                      <button
                        className="small-btn delete"
                        onClick={() => handleDelete(document)}
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
                  No documents found
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
          }}
        >
          <div className="modal create-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create Document</h3>
            <p>Add a new document to the system</p>

            {error && <div className="create-error">{error}</div>}

            <input
              type="text"
              className="modal-input"
              placeholder="Document title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="modal-textarea"
              placeholder="Document description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="modal-actions">
              <button className="btn" onClick={handleCreateDocument}>
                Create
              </button>
              <button
                className="btn secondary"
                onClick={() => {
                  setShowCreateModal(false);
                  setError("");
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