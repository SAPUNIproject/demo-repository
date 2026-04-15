import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import CustomSelect from "../components/CustomSelect";
import "./DocumentDetails.css";

export default function DocumentDetails() {
    const { id } = useParams();

    const [documentInfo, setDocumentInfo] = useState({
        id,
        title: "Project Spec",
        description: "Main project specification document",
        author: "admin",
        status: "Approved",
        activeVersion: "v3",
        createdAt: "2026-04-10",
        updatedAt: "2026-04-14",
    });

    const [versions, setVersions] = useState([
        {
            id: 101,
            versionNumber: 3,
            title: "Project Spec v3",
            status: "Approved",
            author: "admin",
            createdAt: "2026-04-14",
            reviewComment: "Approved for release",
            content:
                "This is version 3 of the project specification. It contains the approved final scope, updated API contract, and release-ready requirements.",
        },
        {
            id: 102,
            versionNumber: 2,
            title: "Project Spec v2",
            status: "Pending Review",
            author: "author1",
            createdAt: "2026-04-13",
            reviewComment: "Waiting for reviewer feedback",
            content:
                "This is version 2 of the project specification. It adds endpoint notes, role handling, and new dashboard requirements.",
        },
        {
            id: 103,
            versionNumber: 1,
            title: "Project Spec v1",
            status: "Draft",
            author: "author1",
            createdAt: "2026-04-12",
            reviewComment: "Initial draft",
            content:
                "This is version 1 of the project specification. Initial draft with core module ideas and basic document flow.",
        },
    ]);

    const [showVersionModal, setShowVersionModal] = useState(false);
    const [versionTitle, setVersionTitle] = useState("");
    const [versionComment, setVersionComment] = useState("");
    const [versionError, setVersionError] = useState("");

    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState(null);

    const [showCompareModal, setShowCompareModal] = useState(false);
    const [compareFirstId, setCompareFirstId] = useState("");
    const [compareSecondId, setCompareSecondId] = useState("");
    const [compareError, setCompareError] = useState("");

    const openVersionModal = () => {
        const maxVersion =
            versions.length > 0
                ? Math.max(...versions.map((v) => v.versionNumber))
                : 0;

        setVersionTitle(`${documentInfo.title} v${maxVersion + 1}`);
        setVersionComment("");
        setVersionError("");
        setShowVersionModal(true);
    };

    const closeVersionModal = () => {
        setShowVersionModal(false);
        setVersionTitle("");
        setVersionComment("");
        setVersionError("");
    };

    const handleCreateVersion = () => {
        if (!versionTitle.trim()) {
            setVersionError("Version title is required.");
            return;
        }

        const nextVersionNumber =
            versions.length > 0
                ? Math.max(...versions.map((v) => v.versionNumber)) + 1
                : 1;

        const newVersion = {
            id: Date.now(),
            versionNumber: nextVersionNumber,
            title: versionTitle.trim(),
            status: "Draft",
            author: "admin",
            createdAt: new Date().toISOString().split("T")[0],
            reviewComment: versionComment.trim() || "New version created",
            content: `Content for ${versionTitle.trim()}`,
        };

        setVersions((prev) => [newVersion, ...prev]);
        closeVersionModal();
    };

    const handleViewVersion = (version) => {
        setSelectedVersion(version);
        setShowViewModal(true);
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setSelectedVersion(null);
    };

    const handleRestoreVersion = (version) => {
        setDocumentInfo((prev) => ({
            ...prev,
            status: version.status,
            activeVersion: `v${version.versionNumber}`,
            updatedAt: new Date().toISOString().split("T")[0],
        }));
    };

    const handleApproveVersion = (versionId) => {
        let approvedVersion = null;

        const updatedVersions = versions.map((version) => {
            if (version.id === versionId) {
                approvedVersion = {
                    ...version,
                    status: "Approved",
                    reviewComment: "Approved by admin",
                };
                return approvedVersion;
            }

            return version;
        });

        setVersions(updatedVersions);

        if (approvedVersion) {
            setDocumentInfo((prev) => ({
                ...prev,
                status: "Approved",
                activeVersion: `v${approvedVersion.versionNumber}`,
                updatedAt: new Date().toISOString().split("T")[0],
            }));
        }
    };

    const handleRejectVersion = (versionId) => {
        const updatedVersions = versions.map((version) =>
            version.id === versionId
                ? {
                    ...version,
                    status: "Rejected",
                    reviewComment: "Rejected by admin",
                }
                : version
        );

        setVersions(updatedVersions);
    };

    const openCompareModal = () => {
        setCompareFirstId("");
        setCompareSecondId("");
        setCompareError("");
        setShowCompareModal(true);
    };

    const closeCompareModal = () => {
        setShowCompareModal(false);
        setCompareFirstId("");
        setCompareSecondId("");
        setCompareError("");
    };

    const firstVersion = versions.find((v) => String(v.id) === compareFirstId);
    const secondVersion = versions.find((v) => String(v.id) === compareSecondId);

    const compareResult = useMemo(() => {
        if (!firstVersion || !secondVersion) return null;

        return {
            sameTitle: firstVersion.title === secondVersion.title,
            sameStatus: firstVersion.status === secondVersion.status,
            sameComment: firstVersion.reviewComment === secondVersion.reviewComment,
            sameContent: firstVersion.content === secondVersion.content,
        };
    }, [firstVersion, secondVersion]);

    const handleCompareVersions = () => {
        if (!compareFirstId || !compareSecondId) {
            setCompareError("Select two versions.");
            return;
        }

        if (compareFirstId === compareSecondId) {
            setCompareError("Choose two different versions.");
            return;
        }

        setCompareError("");
    };

    const versionOptions = versions.map((version) => ({
        value: String(version.id),
        label: `v${version.versionNumber} - ${version.title}`,
    }));

    return (
        <div className="document-details-page">
            <div className="details-header">
                <div>
                    <h2>{documentInfo.title}</h2>
                    <p>Document details and version history.</p>
                </div>

                <div className="details-actions">
                    <Link to="/documents" className="back-btn">
                        Back to Documents
                    </Link>
                    <button className="btn" onClick={openVersionModal}>
                        New Version
                    </button>
                </div>
            </div>

            <div className="details-grid">
                <div className="details-card">
                    <h3>Document Information</h3>

                    <div className="info-row">
                        <span>Title</span>
                        <strong>{documentInfo.title}</strong>
                    </div>

                    <div className="info-row">
                        <span>Description</span>
                        <strong>{documentInfo.description}</strong>
                    </div>

                    <div className="info-row">
                        <span>Author</span>
                        <strong>{documentInfo.author}</strong>
                    </div>

                    <div className="info-row">
                        <span>Status</span>
                        <strong>{documentInfo.status}</strong>
                    </div>

                    <div className="info-row">
                        <span>Active Version</span>
                        <strong>{documentInfo.activeVersion}</strong>
                    </div>

                    <div className="info-row">
                        <span>Created At</span>
                        <strong>{documentInfo.createdAt}</strong>
                    </div>

                    <div className="info-row">
                        <span>Updated At</span>
                        <strong>{documentInfo.updatedAt}</strong>
                    </div>
                </div>

                <div className="details-card">
                    <h3>Quick Actions</h3>

                    <div className="quick-actions">
                        <button
                            className="btn"
                            onClick={() => {
                                const active = versions.find(
                                    (v) => `v${v.versionNumber}` === documentInfo.activeVersion
                                );
                                if (active) handleApproveVersion(active.id);
                            }}
                        >
                            Approve
                        </button>

                        <button
                            className="btn secondary"
                            onClick={() => {
                                const active = versions.find(
                                    (v) => `v${v.versionNumber}` === documentInfo.activeVersion
                                );
                                if (active) handleRejectVersion(active.id);
                            }}
                        >
                            Reject
                        </button>

                        <button className="btn secondary" onClick={openCompareModal}>
                            Compare Versions
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
                                <th>Title</th>
                                <th>Status</th>
                                <th>Author</th>
                                <th>Created At</th>
                                <th>Review Comment</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {versions.map((version) => (
                                <tr key={version.id}>
                                    <td>v{version.versionNumber}</td>
                                    <td>{version.title}</td>
                                    <td>
                                        <span
                                            className={`status-badge ${version.status
                                                .toLowerCase()
                                                .replace(" ", "-")}`}
                                        >
                                            {version.status}
                                        </span>
                                    </td>
                                    <td>{version.author}</td>
                                    <td>{version.createdAt}</td>
                                    <td>{version.reviewComment}</td>
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

                                            <button
                                                className="small-btn approve-btn"
                                                onClick={() => handleApproveVersion(version.id)}
                                            >
                                                Approve
                                            </button>

                                            <button
                                                className="small-btn reject-btn"
                                                onClick={() => handleRejectVersion(version.id)}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showVersionModal && (
                <div className="modal-overlay">
                    <div className="modal version-modal">
                        <h3>Create New Version</h3>
                        <p>Add a new version for this document.</p>

                        {versionError && <div className="version-error">{versionError}</div>}

                        <input
                            type="text"
                            className="modal-input"
                            placeholder="Version title"
                            value={versionTitle}
                            onChange={(e) => setVersionTitle(e.target.value)}
                        />

                        <textarea
                            className="modal-textarea"
                            placeholder="Comment"
                            value={versionComment}
                            onChange={(e) => setVersionComment(e.target.value)}
                        />

                        <div className="modal-actions">
                            <button className="btn secondary" onClick={closeVersionModal}>
                                Cancel
                            </button>
                            <button className="btn" onClick={handleCreateVersion}>
                                Create Version
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showViewModal && selectedVersion && (
                <div className="modal-overlay">
                    <div className="modal version-modal view-modal">
                        <h3>{selectedVersion.title}</h3>
                        <p>Version details</p>

                        <div className="view-details">
                            <div className="view-row">
                                <span>Version</span>
                                <strong>v{selectedVersion.versionNumber}</strong>
                            </div>
                            <div className="view-row">
                                <span>Status</span>
                                <strong>{selectedVersion.status}</strong>
                            </div>
                            <div className="view-row">
                                <span>Author</span>
                                <strong>{selectedVersion.author}</strong>
                            </div>
                            <div className="view-row">
                                <span>Created</span>
                                <strong>{selectedVersion.createdAt}</strong>
                            </div>
                            <div className="view-row">
                                <span>Comment</span>
                                <strong>{selectedVersion.reviewComment}</strong>
                            </div>
                        </div>

                        <div className="content-preview">{selectedVersion.content}</div>

                        <div className="modal-actions">
                            <button className="btn secondary" onClick={closeViewModal}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCompareModal && (
                <div className="modal-overlay">
                    <div className="modal compare-modal">
                        <h3>Compare Versions</h3>
                        <p>Select two versions to compare.</p>

                        {compareError && <div className="version-error">{compareError}</div>}

                        <div className="compare-selects">
                            <CustomSelect
                                value={compareFirstId}
                                onChange={setCompareFirstId}
                                placeholder="Select first version"
                                options={versionOptions}
                            />

                            <CustomSelect
                                value={compareSecondId}
                                onChange={setCompareSecondId}
                                placeholder="Select second version"
                                options={versionOptions}
                            />
                        </div>

                        <div className="modal-actions">
                            <button className="btn secondary" onClick={closeCompareModal}>
                                Close
                            </button>
                            <button className="btn" onClick={handleCompareVersions}>
                                Compare
                            </button>
                        </div>

                        {compareError === "" &&
                            firstVersion &&
                            secondVersion &&
                            compareResult && (
                                <div className="compare-result">
                                    <div className="compare-columns">
                                        <div className="compare-box">
                                            <h4>
                                                v{firstVersion.versionNumber} - {firstVersion.title}
                                            </h4>
                                            <p>
                                                <strong>Status:</strong> {firstVersion.status}
                                            </p>
                                            <p>
                                                <strong>Author:</strong> {firstVersion.author}
                                            </p>
                                            <p>
                                                <strong>Comment:</strong> {firstVersion.reviewComment}
                                            </p>
                                            <div className="compare-content">
                                                {firstVersion.content}
                                            </div>
                                        </div>

                                        <div className="compare-box">
                                            <h4>
                                                v{secondVersion.versionNumber} - {secondVersion.title}
                                            </h4>
                                            <p>
                                                <strong>Status:</strong> {secondVersion.status}
                                            </p>
                                            <p>
                                                <strong>Author:</strong> {secondVersion.author}
                                            </p>
                                            <p>
                                                <strong>Comment:</strong> {secondVersion.reviewComment}
                                            </p>
                                            <div className="compare-content">
                                                {secondVersion.content}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="compare-summary">
                                        <h4>Summary</h4>
                                        <p>Same title: {compareResult.sameTitle ? "Yes" : "No"}</p>
                                        <p>Same status: {compareResult.sameStatus ? "Yes" : "No"}</p>
                                        <p>
                                            Same comment: {compareResult.sameComment ? "Yes" : "No"}
                                        </p>
                                        <p>
                                            Same content: {compareResult.sameContent ? "Yes" : "No"}
                                        </p>
                                    </div>
                                </div>
                            )}
                    </div>
                </div>
            )}
        </div>
    );
}