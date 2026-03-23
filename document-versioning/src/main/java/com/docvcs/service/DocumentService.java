package com.docvcs.service;

import com.docvcs.exception.AuthException;
import com.docvcs.exception.DocumentException;
import com.docvcs.model.*;
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
        this.auditLog  = storage.loadAuditLog();
    }

    // Създай нов документ (само AUTHOR или ADMIN)
    public Document createDocument(String title, User author) {
        if (author.getRole() != Role.AUTHOR && author.getRole() != Role.ADMIN) {
            throw new AuthException("Само автор може да създава документи");
        }
        Document doc = new Document(UUID.randomUUID().toString(),
                title, author.getUsername());
        documents.add(doc);
        storage.saveDocuments(documents);
        log(author.getUsername(), "Създаде документ: " + title);
        return doc;
    }

    // Добави нова версия към документ
    public Version addVersion(String docId, String content, User author) {
        if (author.getRole() != Role.AUTHOR && author.getRole() != Role.ADMIN) {
            throw new AuthException("Само автор може да добавя версии");
        }
        Document doc = findDocumentById(docId);
        int nextNumber = doc.getVersions().size() + 1;
        Version version = new Version(
                UUID.randomUUID().toString(),
                nextNumber, content,
                author.getId(), author.getUsername());
        doc.addVersion(version);
        storage.saveDocuments(documents);
        log(author.getUsername(), "Добави версия v" + nextNumber
                + " към: " + doc.getTitle());
        return version;
    }

    // Изпрати версия за преглед
    public void submitForReview(String docId, int versionNumber, User author) {
        if (author.getRole() != Role.AUTHOR && author.getRole() != Role.ADMIN) {
            throw new AuthException("Само автор може да изпраща за преглед");
        }
        Version version = findVersion(docId, versionNumber);
        if (version.getStatus() != VersionStatus.DRAFT) {
            throw new DocumentException("Само чернови могат да се изпращат за преглед");
        }
        version.setStatus(VersionStatus.PENDING_REVIEW);
        storage.saveDocuments(documents);
        log(author.getUsername(), "Изпрати v" + versionNumber + " за преглед");
    }

    // Одобри версия (само REVIEWER или ADMIN)
    public void approveVersion(String docId, int versionNumber,
                               String comment, User reviewer) {
        if (reviewer.getRole() != Role.REVIEWER && reviewer.getRole() != Role.ADMIN) {
            throw new AuthException("Само рецензент може да одобрява версии");
        }
        Version version = findVersion(docId, versionNumber);
        if (version.getStatus() != VersionStatus.PENDING_REVIEW) {
            throw new DocumentException("Версията не е изпратена за преглед");
        }
        version.setStatus(VersionStatus.APPROVED);
        version.setReviewComment(comment);
        storage.saveDocuments(documents);
        log(reviewer.getUsername(), "Одобри v" + versionNumber
                + " в документ " + docId);
    }

    // Отхвърли версия (само REVIEWER или ADMIN)
    public void rejectVersion(String docId, int versionNumber,
                              String comment, User reviewer) {
        if (reviewer.getRole() != Role.REVIEWER && reviewer.getRole() != Role.ADMIN) {
            throw new AuthException("Само рецензент може да отхвърля версии");
        }
        Version version = findVersion(docId, versionNumber);
        if (version.getStatus() != VersionStatus.PENDING_REVIEW) {
            throw new DocumentException("Версията не е изпратена за преглед");
        }
        version.setStatus(VersionStatus.REJECTED);
        version.setReviewComment(comment);
        storage.saveDocuments(documents);
        log(reviewer.getUsername(), "Отхвърли v" + versionNumber
                + " в документ " + docId);
    }

    // Вземи историята на версиите
    public List<Version> getHistory(String docId) {
        return findDocumentById(docId).getVersions();
    }

    // Сравни две версии — показва разлики ред по ред
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

    // ---- Помощни методи ----

    private Document findDocumentById(String docId) {
        return documents.stream()
                .filter(d -> d.getId().equals(docId))
                .findFirst()
                .orElseThrow(() -> new DocumentException(
                        "Документ с ID '" + docId + "' не е намерен"));
    }

    private Version findVersion(String docId, int versionNumber) {
        Document doc = findDocumentById(docId);
        return doc.getVersions().stream()
                .filter(v -> v.getVersionNumber() == versionNumber)
                .findFirst()
                .orElseThrow(() -> new DocumentException(
                        "Версия v" + versionNumber + " не е намерена"));
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
        this.auditLog  = storage.loadAuditLog();
    }
}