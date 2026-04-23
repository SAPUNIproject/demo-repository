import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDocuments,
  createDocument,
  deleteDocument,
} from "../../services/api";
import "./Documents.css";

export default function Documents() {
  const nav = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedDocument, setSelectedDocument] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setError("");
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

  const openDeleteModal = (document) => {
    setSelectedDocument(document);
    setError("");
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      setError("");

      if (!selectedDocument) return;

      const requesterUsername = localStorage.getItem("username");
      await deleteDocument(selectedDocument.id, requesterUsername);

      setDocuments((prev) =>
        prev.filter((doc) => String(doc.id) !== String(selectedDocument.id))
      );

      setShowDeleteModal(false);
      setSelectedDocument(null);
    } catch (err) {
      setError(err.message || "Failed to delete document");
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
    if (normalized === "rejected") return "status-badge rejected";
    if (
      normalized === "pending review" ||
      normalized === "pending-review" ||
      normalized === "review"
    ) {
      return "status-badge pending-review";
    }
    return "status-badge draft";
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setError("");
    setTitle("");
    setDescription("");
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedDocument(null);
    setError("");
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

      {error && (
        <div className="create-error" style={{ marginBottom: "16px" }}>
          {error}
        </div>
      )}

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
                        className="small-btn view"
                        onClick={() => handleView(document)}
                      >
                        View
                      </button>

                      <button
                        className="small-btn delete"
                        onClick={() => openDeleteModal(document)}
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
        <div className="modal-overlay" onClick={closeCreateModal}>
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
              <button className="btn secondary" onClick={closeCreateModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedDocument && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Document</h3>
            <p>
              Delete <b>{selectedDocument.title}</b>?
            </p>

            <div className="delete-warning">
              This action cannot be undone.
            </div>

            <div className="delete-actions">
              <button className="btn delete-confirm" onClick={handleDelete}>
                Delete
              </button>
              <button className="btn secondary" onClick={closeDeleteModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}