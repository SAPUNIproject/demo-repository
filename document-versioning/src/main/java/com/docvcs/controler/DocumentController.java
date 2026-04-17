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
            User requester = userService.findByUsername(requesterUsername);

            List<DocumentResponse> documents = documentService.getAllDocuments(requester)
                    .stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(documents);
        } catch (AuthException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
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
                        newDocument.getId(),
                        request.getDescription(),
                        requester
                );
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(newDocument));
        } catch (AuthException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    private DocumentResponse toResponse(Document doc) {
        String description = "No description";
        String version = "v0";
        String status = "DRAFT";

        if (doc.getVersions() != null && !doc.getVersions().isEmpty()) {
            Version lastVersion = doc.getVersions().get(doc.getVersions().size() - 1);
            description = lastVersion.getContent();
            version = "v" + lastVersion.getVersionNumber();
            status = lastVersion.getStatus().name();
        }

        return new DocumentResponse(
                doc.getId(),
                doc.getTitle(),
                description,
                version,
                status,
                doc.getAuthor(),
                "-"
        );
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

        public String getId() {
            return id;
        }

        public String getTitle() {
            return title;
        }

        public String getDescription() {
            return description;
        }

        public String getVersion() {
            return version;
        }

        public String getStatus() {
            return status;
        }

        public String getAuthor() {
            return author;
        }

        public String getUpdatedAt() {
            return updatedAt;
        }
    }
}