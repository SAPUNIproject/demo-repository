package com.docvcs.controler;

import com.docvcs.dto.CreateDocumentRequest;
import com.docvcs.dto.ErrorResponse;
import com.docvcs.exception.AuthException;
import com.docvcs.model.Document;
import com.docvcs.model.User;
import com.docvcs.model.Version;
import com.docvcs.service.DocumentService;
import com.docvcs.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "http://localhost:5173")
public class DocumentController {

    private final DocumentService documentService;
    private final UserService userService;

    public DocumentController(DocumentService documentService, UserService userService) {
        this.documentService = documentService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<?> getAllDocuments(@RequestParam String requesterUsername) {
        try {
            userService.findByUsername(requesterUsername);

            List<DocumentResponse> documents = documentService.getAllDocuments()
                    .stream()
                    .map(this::toDocumentResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(documents);
        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<?> getDocumentById(
            @PathVariable String documentId,
            @RequestParam String requesterUsername
    ) {
        try {
            userService.findByUsername(requesterUsername);
            Document document = documentService.getDocumentById(documentId);

            return ResponseEntity.ok(toDocumentDetailsResponse(document));
        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createDocument(
            @RequestBody CreateDocumentRequest request,
            @RequestParam String requesterUsername
    ) {
        try {
            User requester = userService.findByUsername(requesterUsername);

            Document newDocument = documentService.createDocument(
                    request.getTitle(),
                    requester
            );

            if (request.getDescription() != null && !request.getDescription().isBlank()) {
                documentService.addVersion(
                        String.valueOf(newDocument.getId()),
                        request.getDescription(),
                        requester,
                        "Initial version"
                );
            }

            Document updated = documentService.getDocumentById(String.valueOf(newDocument.getId()));
            return ResponseEntity.status(HttpStatus.CREATED).body(toDocumentResponse(updated));

        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/{documentId}/versions")
    public ResponseEntity<?> createVersion(
            @PathVariable String documentId,
            @RequestParam String requesterUsername,
            @RequestBody CreateVersionRequest request
    ) {
        try {
            User requester = userService.findByUsername(requesterUsername);

            Version version = documentService.addVersion(
                    documentId,
                    request.getContent(),
                    requester,
                    request.getComment()
            );

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(toVersionResponse(version));

        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/{documentId}/versions/{versionId}/approve")
    public ResponseEntity<?> approveVersion(
            @PathVariable String documentId,
            @PathVariable String versionId,
            @RequestParam String requesterUsername
    ) {
        try {
            User requester = userService.findByUsername(requesterUsername);
            Version version = documentService.approveVersion(documentId, versionId, requester);
            return ResponseEntity.ok(toVersionResponse(version));

        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/{documentId}/versions/{versionId}/reject")
    public ResponseEntity<?> rejectVersion(
            @PathVariable String documentId,
            @PathVariable String versionId,
            @RequestParam String requesterUsername
    ) {
        try {
            User requester = userService.findByUsername(requesterUsername);
            Version version = documentService.rejectVersion(documentId, versionId, requester);
            return ResponseEntity.ok(toVersionResponse(version));

        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/{documentId}/versions/{versionId}/restore")
    public ResponseEntity<?> restoreVersion(
            @PathVariable String documentId,
            @PathVariable String versionId,
            @RequestParam String requesterUsername
    ) {
        try {
            User requester = userService.findByUsername(requesterUsername);
            Document document = documentService.restoreVersion(documentId, versionId, requester);
            return ResponseEntity.ok(toDocumentDetailsResponse(document));

        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    private DocumentResponse toDocumentResponse(Document doc) {
        Version lastVersion = getLastVersion(doc);

        String description = lastVersion != null ? safe(lastVersion.getContent()) : "No description";
        String version = lastVersion != null ? "v" + lastVersion.getVersionNumber() : "v0";
        String status = lastVersion != null ? safe(lastVersion.getStatus().name()) : "DRAFT";
        String author = safe(doc.getCreatedByUsername());
        String updatedAt = lastVersion != null ? safe(lastVersion.getCreatedAt().toString()) : "-";

        return new DocumentResponse(
                String.valueOf(doc.getId()),
                safe(doc.getTitle()),
                description,
                version,
                status,
                author,
                updatedAt
        );
    }

    private DocumentDetailsResponse toDocumentDetailsResponse(Document doc) {
        Version lastVersion = getLastVersion(doc);

        List<VersionResponse> versions = doc.getVersions()
                .stream()
                .map(this::toVersionResponse)
                .collect(Collectors.toList());

        return new DocumentDetailsResponse(
                String.valueOf(doc.getId()),
                safe(doc.getTitle()),
                lastVersion != null ? safe(lastVersion.getContent()) : "No description",
                safe(doc.getCreatedByUsername()),
                lastVersion != null ? "v" + lastVersion.getVersionNumber() : "v0",
                lastVersion != null ? safe(lastVersion.getStatus().name()) : "DRAFT",
                lastVersion != null ? safe(lastVersion.getCreatedAt().toString()) : "-",
                versions
        );
    }

    private VersionResponse toVersionResponse(Version version) {
        return new VersionResponse(
                String.valueOf(version.getId()),
                "v" + version.getVersionNumber(),
                safe(version.getContent()),
                safe(version.getStatus().name()),
                safe(version.getAuthorUsername()),
                safe(version.getCreatedAt().toString()),
                safe(version.getReviewComment())
        );
    }

    private Version getLastVersion(Document doc) {
        if (doc.getVersions() == null || doc.getVersions().isEmpty()) {
            return null;
        }
        return doc.getVersions().get(doc.getVersions().size() - 1);
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    public static class CreateVersionRequest {
        private String content;
        private String comment;

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public String getComment() {
            return comment;
        }

        public void setComment(String comment) {
            this.comment = comment;
        }
    }

    public static class DocumentResponse {
        private String id;
        private String title;
        private String description;
        private String version;
        private String status;
        private String author;
        private String updatedAt;

        public DocumentResponse(String id, String title, String description,
                                String version, String status, String author, String updatedAt) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.version = version;
            this.status = status;
            this.author = author;
            this.updatedAt = updatedAt;
        }

        public String getId() { return id; }
        public String getTitle() { return title; }
        public String getDescription() { return description; }
        public String getVersion() { return version; }
        public String getStatus() { return status; }
        public String getAuthor() { return author; }
        public String getUpdatedAt() { return updatedAt; }
    }

    public static class DocumentDetailsResponse {
        private String id;
        private String title;
        private String description;
        private String author;
        private String currentVersion;
        private String status;
        private String updatedAt;
        private List<VersionResponse> versions;

        public DocumentDetailsResponse(String id, String title, String description, String author,
                                       String currentVersion, String status, String updatedAt,
                                       List<VersionResponse> versions) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.author = author;
            this.currentVersion = currentVersion;
            this.status = status;
            this.updatedAt = updatedAt;
            this.versions = versions;
        }

        public String getId() { return id; }
        public String getTitle() { return title; }
        public String getDescription() { return description; }
        public String getAuthor() { return author; }
        public String getCurrentVersion() { return currentVersion; }
        public String getStatus() { return status; }
        public String getUpdatedAt() { return updatedAt; }
        public List<VersionResponse> getVersions() { return versions; }
    }

    public static class VersionResponse {
        private String id;
        private String version;
        private String content;
        private String status;
        private String author;
        private String createdAt;
        private String comment;

        public VersionResponse(String id, String version, String content,
                               String status, String author, String createdAt, String comment) {
            this.id = id;
            this.version = version;
            this.content = content;
            this.status = status;
            this.author = author;
            this.createdAt = createdAt;
            this.comment = comment;
        }

        public String getId() { return id; }
        public String getVersion() { return version; }
        public String getContent() { return content; }
        public String getStatus() { return status; }
        public String getAuthor() { return author; }
        public String getCreatedAt() { return createdAt; }
        public String getComment() { return comment; }
    }
}