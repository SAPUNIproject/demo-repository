const API_BASE = "http://localhost:8080/api";

export async function loginUser(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Login failed");
    }

    return data;
}

export async function getUsers(requesterUsername) {
    const res = await fetch(
        `http://localhost:8080/api/users?requesterUsername=${requesterUsername}`
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message);
    }

    return data;
}

export async function createUser(requesterUsername, userData) {
    const res = await fetch(
        `http://localhost:8080/api/users?requesterUsername=${requesterUsername}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        }
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message);
    }

    return data;
}

export async function getDocuments(requesterUsername) {
    const res = await fetch(
        `http://localhost:8080/api/documents?requesterUsername=${encodeURIComponent(requesterUsername)}`
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to load documents");
    }

    return data;
}

export async function createDocument(requesterUsername, docData) {
    const res = await fetch(
        `http://localhost:8080/api/documents?requesterUsername=${encodeURIComponent(requesterUsername)}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(docData),
        }
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to create document");
    }

    return data;
}
export async function getDocumentById(documentId, requesterUsername) {
    const res = await fetch(
        `${API_BASE}/documents/${documentId}?requesterUsername=${encodeURIComponent(requesterUsername)}`
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to load document");
    }

    return data;
}

export async function createDocumentVersion(documentId, requesterUsername, versionData) {
    const res = await fetch(
        `${API_BASE}/documents/${documentId}/versions?requesterUsername=${encodeURIComponent(requesterUsername)}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(versionData),
        }
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to create version");
    }

    return data;
}

export async function approveVersion(documentId, versionId, requesterUsername) {
    const res = await fetch(
        `${API_BASE}/documents/${documentId}/versions/${versionId}/approve?requesterUsername=${encodeURIComponent(requesterUsername)}`,
        {
            method: "POST",
        }
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to approve version");
    }

    return data;
}

export async function rejectVersion(documentId, versionId, requesterUsername) {
    const res = await fetch(
        `${API_BASE}/documents/${documentId}/versions/${versionId}/reject?requesterUsername=${encodeURIComponent(requesterUsername)}`,
        {
            method: "POST",
        }
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to reject version");
    }

    return data;
}

export async function restoreVersion(documentId, versionId, requesterUsername) {
    const res = await fetch(
        `${API_BASE}/documents/${documentId}/versions/${versionId}/restore?requesterUsername=${encodeURIComponent(requesterUsername)}`,
        {
            method: "POST",
        }
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to restore version");
    }

    return data;
}