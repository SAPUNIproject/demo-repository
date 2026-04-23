import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getDocumentById,
    createDocumentVersion,
    approveVersion,
    rejectVersion,
    restoreVersion,
} from "../../services/api";
import "./DocumentDetails.css";

export default function DocumentDetails() {
    const nav = useNavigate();
    const { id } = useParams();

    const [documentData, setDocumentData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showVersionModal, setShowVersionModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showCompareModal, setShowCompareModal] = useState(false);

    const [selectedVersion, setSelectedVersion] = useState(null);
    const [compareLeftId, setCompareLeftId] = useState("");
    const [compareRightId, setCompareRightId] = useState("");

    const [newContent, setNewContent] = useState("");
    const [newComment, setNewComment] = useState("");
    const [versionError, setVersionError] = useState("");
    const [pageError, setPageError] = useState("");

    const role = (localStorage.getItem("role") || "READER").toUpperCase();
    const requesterUsername = localStorage.getItem("username") || "";

    const canCreateVersion = role === "ADMIN" || role === "AUTHOR";
    const canApproveReject = role === "ADMIN" || role === "REVIEWER";

    useEffect(() => {
        loadDocument();
    }, [id]);

    const loadDocument = async () => {
        try {
            setLoading(true);
            setPageError("");

            const data = await getDocumentById(id, requesterUsername);
            setDocumentData(data);
        } catch (err) {
            setPageError(err.message || "Failed to load document");
        } finally {
            setLoading(false);
        }
    };

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

    const handleCreateVersion = async () => {
        try {
            setVersionError("");

            if (!newContent.trim()) {
                setVersionError("Content is required");
                return;
            }

            await createDocumentVersion(id, requesterUsername, {
                content: newContent.trim(),
                comment: newComment.trim(),
            });

            setNewContent("");
            setNewComment("");
            setShowVersionModal(false);
            await loadDocument();
        } catch (err) {
            setVersionError(err.message || "Failed to create version");
        }
    };

    const handleViewVersion = (version) => {
        setSelectedVersion(version);
        setShowViewModal(true);
    };

    const handleRestoreVersion = async (version) => {
        try {
            await restoreVersion(id, version.id, requesterUsername);
            await loadDocument();
        } catch (err) {
            alert(err.message || "Failed to restore version");
        }
    };

    const handleApprove = async (version) => {
        try {
            await approveVersion(id, version.id, requesterUsername);
            await loadDocument();
        } catch (err) {
            alert(err.message || "Failed to approve version");
        }
    };

    const handleReject = async (version) => {
        try {
            await rejectVersion(id, version.id, requesterUsername);
            await loadDocument();
        } catch (err) {
            alert(err.message || "Failed to reject version");
        }
    };

    const leftVersion = useMemo(() => {
        return documentData?.versions?.find((v) => v.id === compareLeftId) || null;
    }, [compareLeftId, documentData]);

    const rightVersion = useMemo(() => {
        return documentData?.versions?.find((v) => v.id === compareRightId) || null;
    }, [compareRightId, documentData]);

    if (loading) {
        return (
            <div className="document-details-page">
                <div className="details-card">
                    <h3>Loading...</h3>
                </div>
            </div>
        );
    }

    if (pageError) {
        return (
            <div className="document-details-page">
                <div className="details-card">
                    <h3>Error</h3>
                    <p>{pageError}</p>
                    <button className="btn secondary" onClick={() => nav(-1)}>
                        Back
                    </button>
                </div>
            </div>
        );
    }

    if (!documentData) {
        return (
            <div className="document-details-page">
                <div className="details-card">
                    <h3>Document not found</h3>
                    <button className="btn secondary" onClick={() => nav(-1)}>
                        Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="document-details-page">
            <div className="details-header">
                <div>
                    <button className="back-btn" onClick={() => nav(-1)}>
                        Back
                    </button>
                    <h2>{documentData.title}</h2>
                    <p>{documentData.description}</p>
                </div>

                <div className="details-actions">
                    {canCreateVersion && (
                        <button className="btn" onClick={() => setShowVersionModal(true)}>
                            + New Version
                        </button>
                    )}

                    <button className="btn secondary" onClick={() => setShowCompareModal(true)}>
                        Compare Versions
                    </button>
                </div>
            </div>

            <div className="details-grid">
                <div className="details-card">
                    <h3>Document Info</h3>

                    <div className="info-row">
                        <span>ID</span>
                        <strong>{documentData.id}</strong>
                    </div>

                    <div className="info-row">
                        <span>Author</span>
                        <strong>{documentData.author}</strong>
                    </div>

                    <div className="info-row">
                        <span>Current Version</span>
                        <strong>{documentData.currentVersion}</strong>
                    </div>

                    <div className="info-row">
                        <span>Status</span>
                        <strong>
                            <span className={getStatusClass(documentData.status)}>
                                {documentData.status}
                            </span>
                        </strong>
                    </div>

                    <div className="info-row">
                        <span>Updated</span>
                        <strong>{documentData.updatedAt}</strong>
                    </div>
                </div>

                <div className="details-card">
                    <h3>Quick Actions</h3>

                    <div className="quick-actions">
                        {canCreateVersion && (
                            <button className="btn" onClick={() => setShowVersionModal(true)}>
                                Create Version
                            </button>
                        )}

                        <button
                            className="btn secondary"
                            onClick={() => setShowCompareModal(true)}
                        >
                            Compare
                        </button>
                    </div>
                </div>
            </div>

            <div className="versions-section">
                <h3>Versions</h3>

                <div className="versions-table-wrapper">
                    <table className="versions-table">
                        <thead>
                            <tr>
                                <th>Version</th>
                                <th>Status</th>
                                <th>Author</th>
                                <th>Created</th>
                                <th>Comment</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {documentData.versions?.length ? (
                                documentData.versions
                                    .slice()
                                    .reverse()
                                    .map((version) => (
                                        <tr key={version.id}>
                                            <td>{version.version}</td>
                                            <td>
                                                <span className={getStatusClass(version.status)}>
                                                    {version.status}
                                                </span>
                                            </td>
                                            <td>{version.author}</td>
                                            <td>{version.createdAt}</td>
                                            <td>{version.comment}</td>
                                            <td>
                                                <div className="version-actions">
                                                    <button
                                                        className="small-btn"
                                                        onClick={() => handleViewVersion(version)}
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        className="small-btn"
                                                        onClick={() => handleRestoreVersion(version)}
                                                    >
                                                        Restore
                                                    </button>

                                                    {canApproveReject && (
                                                        <>
                                                            <button
                                                                className="small-btn approve-btn"
                                                                onClick={() => handleApprove(version)}
                                                            >
                                                                Approve
                                                            </button>

                                                            <button
                                                                className="small-btn reject-btn"
                                                                onClick={() => handleReject(version)}
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                            ) : (
                                <tr>
                                    <td colSpan="6">No versions found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showVersionModal && (
                <div
                    className="modal-overlay"
                    onClick={() => {
                        setShowVersionModal(false);
                        setVersionError("");
                    }}
                >
                    <div className="modal version-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Create New Version</h3>
                        <p>Add updated content for this document</p>

                        {versionError && <div className="version-error">{versionError}</div>}

                        <textarea
                            className="modal-textarea"
                            placeholder="Version content..."
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                        />

                        <input
                            type="text"
                            className="modal-input"
                            placeholder="Version comment"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />

                        <div className="modal-actions">
                            <button className="btn" onClick={handleCreateVersion}>
                                Save Version
                            </button>
                            <button
                                className="btn secondary"
                                onClick={() => {
                                    setShowVersionModal(false);
                                    setVersionError("");
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showViewModal && selectedVersion && (
                <div
                    className="modal-overlay"
                    onClick={() => {
                        setShowViewModal(false);
                        setSelectedVersion(null);
                    }}
                >
                    <div className="modal view-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Version Details</h3>

                        <div className="view-details">
                            <div className="view-row">
                                <strong>Version:</strong>
                                <span>{selectedVersion.version}</span>
                            </div>

                            <div className="view-row">
                                <strong>Status:</strong>
                                <span>{selectedVersion.status}</span>
                            </div>

                            <div className="view-row">
                                <strong>Author:</strong>
                                <span>{selectedVersion.author}</span>
                            </div>

                            <div className="view-row">
                                <strong>Created:</strong>
                                <span>{selectedVersion.createdAt}</span>
                            </div>

                            <div className="view-row">
                                <strong>Comment:</strong>
                                <span>{selectedVersion.comment}</span>
                            </div>
                        </div>

                        <div className="content-preview">{selectedVersion.content}</div>

                        <div className="modal-actions">
                            <button
                                className="btn secondary"
                                onClick={() => {
                                    setShowViewModal(false);
                                    setSelectedVersion(null);
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCompareModal && (
                <div
                    className="modal-overlay"
                    onClick={() => {
                        setShowCompareModal(false);
                        setCompareLeftId("");
                        setCompareRightId("");
                    }}
                >
                    <div className="modal compare-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Compare Versions</h3>
                        <p>Select two versions to compare</p>

                        <div className="compare-selects">
                            <select
                                className="modal-input"
                                value={compareLeftId}
                                onChange={(e) => setCompareLeftId(e.target.value)}
                            >
                                <option value="">Select first version</option>
                                {documentData.versions?.map((version) => (
                                    <option key={version.id} value={version.id}>
                                        {version.version}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="modal-input"
                                value={compareRightId}
                                onChange={(e) => setCompareRightId(e.target.value)}
                            >
                                <option value="">Select second version</option>
                                {documentData.versions?.map((version) => (
                                    <option key={version.id} value={version.id}>
                                        {version.version}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {leftVersion && rightVersion && (
                            <div className="compare-result">
                                <div className="compare-columns">
                                    <div className="compare-box">
                                        <h4>{leftVersion.version}</h4>
                                        <p><strong>Status:</strong> {leftVersion.status}</p>
                                        <p><strong>Author:</strong> {leftVersion.author}</p>
                                        <p><strong>Comment:</strong> {leftVersion.comment}</p>
                                        <div className="compare-content">{leftVersion.content}</div>
                                    </div>

                                    <div className="compare-box">
                                        <h4>{rightVersion.version}</h4>
                                        <p><strong>Status:</strong> {rightVersion.status}</p>
                                        <p><strong>Author:</strong> {rightVersion.author}</p>
                                        <p><strong>Comment:</strong> {rightVersion.comment}</p>
                                        <div className="compare-content">{rightVersion.content}</div>
                                    </div>
                                </div>

                                <div className="compare-summary">
                                    <h4>Summary</h4>
                                    <p>
                                        Comparing <strong>{leftVersion.version}</strong> with{" "}
                                        <strong>{rightVersion.version}</strong>.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="modal-actions">
                            <button
                                className="btn secondary"
                                onClick={() => {
                                    setShowCompareModal(false);
                                    setCompareLeftId("");
                                    setCompareRightId("");
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}