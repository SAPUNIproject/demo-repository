import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Documents.css";

export default function Documents() {
  const [search, setSearch] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [createError, setCreateError] = useState("");

  const currentUsername = localStorage.getItem("username") || "";

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setPageError("");

      const response = await fetch(
        `http://localhost:8080/api/documents?requesterUsername=${encodeURIComponent(currentUsername)}`
      );

      const data = await response.json();

      if (!response.ok) {
        setPageError(data.message || "Failed to load documents.");
        setDocuments([]);
        return;
      }

      setDocuments(data);
    } catch (error) {
      setPageError("Cannot connect to server.");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUsername) {
      loadDocuments();
    } else {
      setLoading(false);
      setPageError("No logged in user found.");
    }
  }, []);

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

  const handleCreateDocument = async () => {
    if (!newTitle.trim()) {
      setCreateError("Title is required.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/documents?requesterUsername=${encodeURIComponent(currentUsername)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: newTitle.trim(),
            description: newDescription.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setCreateError(data.message || "Failed to create document.");
        return;
      }

      closeCreateModal();
      loadDocuments();
    } catch (error) {
      setCreateError("Cannot connect to server.");
    }
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
          <button className="btn secondary" onClick={openCreateModal}>
            Create Document
          </button>
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

      {pageError && <div className="create-error">{pageError}</div>}

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
            {loading ? (
              <tr>
                <td colSpan="7" className="empty-row">
                  Loading documents...
                </td>
              </tr>
            ) : filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.title}</td>
                  <td>{doc.description}</td>
                  <td>{doc.version}</td>
                  <td>
                    <span
                      className={`status-badge ${doc.status.toLowerCase().replaceAll("_", "-")}`}
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
    </div>
  );
}