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

// Регистрация на нов потребител. Backend-ът не приема ADMIN роля тук.
export async function registerUser(username, email, password, role) {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, role }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Registration failed");
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
export async function deleteUser(userId, requesterUsername) {
    const res = await fetch(
        `${API_BASE}/users/${userId}?requesterUsername=${encodeURIComponent(requesterUsername)}`,
        {
            method: "DELETE",
        }
    );

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to delete user");
    }
}

export async function changeUserRole(userId, role, requesterUsername) {
    const res = await fetch(
        `${API_BASE}/users/${userId}/role?role=${encodeURIComponent(role)}&requesterUsername=${encodeURIComponent(requesterUsername)}`,
        {
            method: "PUT",
        }
    );

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update role");
    }
}

export async function deleteDocument(documentId, requesterUsername) {
    const res = await fetch(
        `${API_BASE}/documents/${documentId}?requesterUsername=${encodeURIComponent(requesterUsername)}`,
        {
            method: "DELETE",
        }
    );

    if (!res.ok) {
        let message = "Failed to delete document";
        try {
            const data = await res.json();
            message = data.message || message;
        } catch {
            const text = await res.text();
            message = text || message;
        }
        throw new Error(message);
    }
}