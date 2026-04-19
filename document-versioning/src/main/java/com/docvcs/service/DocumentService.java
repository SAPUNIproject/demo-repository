package com.docvcs.service;

import com.docvcs.exception.AuthException;
import com.docvcs.exception.DocumentException;
import com.docvcs.model.AuditLogEntry;
import com.docvcs.model.Document;
import com.docvcs.model.Role;
import com.docvcs.model.User;
import com.docvcs.model.Version;
import com.docvcs.model.VersionStatus;
import com.docvcs.storage.JsonStorage;

import java.util.List;
import java.util.UUID;

public class DocumentService {
    private final JsonStorage storage;
    private List<Document> documents;
    private List<AuditLogEntry> auditLog;

    public DocumentService(JsonStorage storage) {
        this.storage = storage;
        this.documents = storage.loadDocuments();
        this.auditLog = storage.loadAuditLog();
    }

    public Document createDocument(String title, User author) {
        if (author.getRole() != Role.AUTHOR && author.getRole() != Role.ADMIN) {
            throw new AuthException("Само автор или админ може да създава документи");
        }

        Document doc = new Document(
                UUID.randomUUID().toString(),
                title,
                author.getUsername()
        );

        documents.add(doc);
        storage.saveDocuments(documents);
        log(author.getUsername(), "Създаде документ: " + title);

        return doc;
    }

    public Version addVersion(String docId, String content, User author) {
        return addVersion(docId, content, author, "No comment");
    }

    public Version addVersion(String docId, String content, User author, String comment) {
        if (author.getRole() != Role.AUTHOR && author.getRole() != Role.ADMIN) {
            throw new AuthException("Само автор или админ може да добавя версии");
        }

        Document doc = findDocumentById(docId);
        int nextNumber = doc.getVersions().size() + 1;

        Version version = new Version(
                UUID.randomUUID().toString(),
                nextNumber,
                content,
                author.getId(),
                author.getUsername()
        );

        version.setStatus(VersionStatus.DRAFT);
        version.setReviewComment(comment == null || comment.isBlank() ? "No comment" : comment);

        doc.addVersion(version);
        storage.saveDocuments(documents);

        log(author.getUsername(), "Добави версия v" + nextNumber + " към: " + doc.getTitle());

        return version;
    }

    public void submitForReview(String docId, int versionNumber, User author) {
        if (author.getRole() != Role.AUTHOR && author.getRole() != Role.ADMIN) {
            throw new AuthException("Само автор или админ може да изпраща за преглед");
        }

        Version version = findVersion(docId, versionNumber);

        if (version.getStatus() != VersionStatus.DRAFT) {
            throw new DocumentException("Само чернови могат да се изпращат за преглед");
        }

        version.setStatus(VersionStatus.PENDING_REVIEW);
        storage.saveDocuments(documents);
        log(author.getUsername(), "Изпрати v" + versionNumber + " за преглед");
    }

    public Version approveVersion(String docId, String versionId, User reviewer) {
        if (reviewer.getRole() != Role.REVIEWER && reviewer.getRole() != Role.ADMIN) {
            throw new AuthException("Само reviewer или admin може да одобрява версии");
        }

        Version version = findVersionById(docId, versionId);

        if (version.getStatus() != VersionStatus.PENDING_REVIEW &&
                version.getStatus() != VersionStatus.DRAFT) {
            throw new DocumentException("Версията не може да бъде одобрена");
        }

        version.setStatus(VersionStatus.APPROVED);
        version.setReviewComment("Approved by " + reviewer.getUsername());

        storage.saveDocuments(documents);
        log(reviewer.getUsername(), "Одобри " + versionId + " в документ " + docId);

        return version;
    }

    public void approveVersion(String docId, int versionNumber, String comment, User reviewer) {
        if (reviewer.getRole() != Role.REVIEWER && reviewer.getRole() != Role.ADMIN) {
            throw new AuthException("Само reviewer или admin може да одобрява версии");
        }

        Version version = findVersion(docId, versionNumber);

        if (version.getStatus() != VersionStatus.PENDING_REVIEW) {
            throw new DocumentException("Версията не е изпратена за преглед");
        }

        version.setStatus(VersionStatus.APPROVED);
        version.setReviewComment(comment);
        storage.saveDocuments(documents);
        log(reviewer.getUsername(), "Одобри v" + versionNumber + " в документ " + docId);
    }

    public Version rejectVersion(String docId, String versionId, User reviewer) {
        if (reviewer.getRole() != Role.REVIEWER && reviewer.getRole() != Role.ADMIN) {
            throw new AuthException("Само reviewer или admin може да отхвърля версии");
        }

        Version version = findVersionById(docId, versionId);

        if (version.getStatus() != VersionStatus.PENDING_REVIEW &&
                version.getStatus() != VersionStatus.DRAFT) {
            throw new DocumentException("Версията не може да бъде отхвърлена");
        }

        version.setStatus(VersionStatus.REJECTED);
        version.setReviewComment("Rejected by " + reviewer.getUsername());

        storage.saveDocuments(documents);
        log(reviewer.getUsername(), "Отхвърли " + versionId + " в документ " + docId);

        return version;
    }

    public void rejectVersion(String docId, int versionNumber, String comment, User reviewer) {
        if (reviewer.getRole() != Role.REVIEWER && reviewer.getRole() != Role.ADMIN) {
            throw new AuthException("Само reviewer или admin може да отхвърля версии");
        }

        Version version = findVersion(docId, versionNumber);

        if (version.getStatus() != VersionStatus.PENDING_REVIEW) {
            throw new DocumentException("Версията не е изпратена за преглед");
        }

        version.setStatus(VersionStatus.REJECTED);
        version.setReviewComment(comment);
        storage.saveDocuments(documents);
        log(reviewer.getUsername(), "Отхвърли v" + versionNumber + " в документ " + docId);
    }

    public Document restoreVersion(String docId, String versionId, User requester) {
        if (requester.getRole() != Role.AUTHOR && requester.getRole() != Role.ADMIN) {
            throw new AuthException("Само author или admin може да restore-ва версии");
        }

        Document doc = findDocumentById(docId);
        Version target = findVersionById(docId, versionId);

        int nextNumber = doc.getVersions().size() + 1;

        Version restored = new Version(
                UUID.randomUUID().toString(),
                nextNumber,
                target.getContent(),
                requester.getId(),
                requester.getUsername()
        );

        restored.setStatus(VersionStatus.DRAFT);
        restored.setReviewComment("Restored from " + versionId);

        doc.addVersion(restored);
        storage.saveDocuments(documents);

        log(requester.getUsername(), "Restore-на " + versionId + " в документ " + docId);

        return doc;
    }

    public Document getDocumentById(String docId) {
        return findDocumentById(docId);
    }

    public List<Version> getHistory(String docId) {
        return findDocumentById(docId).getVersions();
    }

    public String diffVersions(String docId, int v1num, int v2num) {
        Version v1 = findVersion(docId, v1num);
        Version v2 = findVersion(docId, v2num);

        String[] lines1 = v1.getContent().split("\n");
        String[] lines2 = v2.getContent().split("\n");

        StringBuilder sb = new StringBuilder();
        sb.append("--- v").append(v1num).append("\n");
        sb.append("+++ v").append(v2num).append("\n\n");

        int max = Math.max(lines1.length, lines2.length);
        for (int i = 0; i < max; i++) {
            String l1 = i < lines1.length ? lines1[i] : "";
            String l2 = i < lines2.length ? lines2[i] : "";

            if (!l1.equals(l2)) {
                if (!l1.isEmpty()) sb.append("- ").append(l1).append("\n");
                if (!l2.isEmpty()) sb.append("+ ").append(l2).append("\n");
            } else {
                sb.append("  ").append(l1).append("\n");
            }
        }

        return sb.toString();
    }

    public List<Document> getAllDocuments() {
        return documents;
    }

    private Document findDocumentById(String docId) {
        return documents.stream()
                .filter(d -> d.getId().equals(docId))
                .findFirst()
                .orElseThrow(() ->
                        new DocumentException("Документ с ID '" + docId + "' не е намерен"));
    }

    private Version findVersion(String docId, int versionNumber) {
        Document doc = findDocumentById(docId);

        return doc.getVersions().stream()
                .filter(v -> v.getVersionNumber() == versionNumber)
                .findFirst()
                .orElseThrow(() ->
                        new DocumentException("Версия v" + versionNumber + " не е намерена"));
    }

    private Version findVersionById(String docId, String versionId) {
        Document doc = findDocumentById(docId);

        return doc.getVersions().stream()
                .filter(v -> v.getId().equals(versionId))
                .findFirst()
                .orElseThrow(() ->
                        new DocumentException("Версия с ID '" + versionId + "' не е намерена"));
    }

    private void log(String username, String action) {
        auditLog.add(new AuditLogEntry(username, action));
        storage.saveAuditLog(auditLog);
    }

    public List<AuditLogEntry> getAuditLog(User requester) {
        if (requester.getRole() != Role.ADMIN) {
            throw new AuthException("Само администратор може да вижда audit log-а");
        }
        return auditLog;
    }

    public void reload() {
        this.documents = storage.loadDocuments();
        this.auditLog = storage.loadAuditLog();
    }
}