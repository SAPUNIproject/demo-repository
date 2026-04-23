package com.docvcs.service;

import com.docvcs.exception.AuthException;
import com.docvcs.exception.DocumentException;
import com.docvcs.model.AuditLogEntry;
import com.docvcs.model.Document;
import com.docvcs.model.Role;
import com.docvcs.model.User;
import com.docvcs.model.Version;
import com.docvcs.model.VersionStatus;
import com.docvcs.repository.DocumentRepository;
import com.docvcs.repository.VersionRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final VersionRepository versionRepository;

    private final List<AuditLogEntry> auditLog = new ArrayList<>();

    public DocumentService(DocumentRepository documentRepository,
                           VersionRepository versionRepository) {
        this.documentRepository = documentRepository;
        this.versionRepository = versionRepository;
    }

    public Document createDocument(String title, User author) {
        if (author.getRole() != Role.AUTHOR && author.getRole() != Role.ADMIN) {
            throw new AuthException("Само автор или админ може да създава документи");
        }

        Document doc = new Document(title, author.getUsername());
        Document saved = documentRepository.save(doc);

        log(author.getUsername(), "Създаде документ: " + title);
        return saved;
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
                nextNumber,
                content,
                author.getId() != null ? String.valueOf(author.getId()) : null,
                author.getUsername()
        );

        version.setStatus(VersionStatus.DRAFT);
        version.setReviewComment(comment == null || comment.isBlank() ? "No comment" : comment);
        version.setDocument(doc);

        Version savedVersion = versionRepository.save(version);

        doc.getVersions().add(savedVersion);
        documentRepository.save(doc);

        log(author.getUsername(), "Добави версия v" + nextNumber + " към: " + doc.getTitle());
        return savedVersion;
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
        versionRepository.save(version);

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

        Version saved = versionRepository.save(version);

        log(reviewer.getUsername(), "Одобри " + versionId + " в документ " + docId);
        return saved;
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
        versionRepository.save(version);

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

        Version saved = versionRepository.save(version);

        log(reviewer.getUsername(), "Отхвърли " + versionId + " в документ " + docId);
        return saved;
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
        versionRepository.save(version);

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
                nextNumber,
                target.getContent(),
                requester.getId() != null ? String.valueOf(requester.getId()) : null,
                requester.getUsername()
        );

        restored.setStatus(VersionStatus.DRAFT);
        restored.setReviewComment("Restored from " + versionId);
        restored.setDocument(doc);

        Version savedRestored = versionRepository.save(restored);

        doc.getVersions().add(savedRestored);
        Document savedDoc = documentRepository.save(doc);

        log(requester.getUsername(), "Restore-на " + versionId + " в документ " + docId);
        return savedDoc;
    }

    public void deleteDocument(Long id, User requester) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new AuthException("Документът не е намерен"));

        if (requester.getRole() != Role.ADMIN) {
            throw new AuthException("Само администратор може да трие документи");
        }

        documentRepository.delete(document);
        log(requester.getUsername(), "Изтри документ: " + document.getTitle());
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
        return documentRepository.findAll();
    }

    private Document findDocumentById(String docId) {
        Long id;
        try {
            id = Long.parseLong(docId);
        } catch (NumberFormatException e) {
            throw new DocumentException("Невалидно document ID: " + docId);
        }

        return documentRepository.findById(id)
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
                .filter(v -> String.valueOf(v.getId()).equals(versionId))
                .findFirst()
                .orElseThrow(() ->
                        new DocumentException("Версия с ID '" + versionId + "' не е намерена"));
    }

    private void log(String username, String action) {
        auditLog.add(new AuditLogEntry(username, action));
    }

    public List<AuditLogEntry> getAuditLog(User requester) {
        if (requester.getRole() != Role.ADMIN) {
            throw new AuthException("Само администратор може да вижда audit log-а");
        }
        return auditLog;
    }

    public void reload() {
    }
}