package com.docvcs.controler;

import com.docvcs.exception.AuthException;
import com.docvcs.model.Document;
import com.docvcs.model.User;
import com.docvcs.model.Version;
import com.docvcs.model.VersionStatus;
import com.docvcs.service.DocumentService;
import com.docvcs.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final UserService userService;
    private final DocumentService documentService;

    public DashboardController(UserService userService, DocumentService documentService) {
        this.userService = userService;
        this.documentService = documentService;
    }

    @GetMapping
    public ResponseEntity<?> getDashboard(@RequestParam String requesterUsername) {
        try {
            User requester = userService.findByUsername(requesterUsername);
            List<Document> documents = documentService.getAllDocuments();

            int totalDocuments = documents.size();
            int totalUsers = requester.getRole().name().equals("ADMIN")
                    ? userService.getAllUsers(requester).size()
                    : 0;

            int approved = 0;
            int rejected = 0;
            int draft = 0;
            int pending = 0;

            for (Document doc : documents) {
                if (doc.getVersions() == null || doc.getVersions().isEmpty()) continue;

                Version last = doc.getVersions().get(doc.getVersions().size() - 1);

                if (last.getStatus() == VersionStatus.APPROVED) approved++;
                else if (last.getStatus() == VersionStatus.REJECTED) rejected++;
                else if (last.getStatus() == VersionStatus.DRAFT) draft++;
                else if (last.getStatus() == VersionStatus.PENDING_REVIEW) pending++;
            }

            List<RecentDocumentResponse> recentDocuments = documents.stream()
                    .filter(d -> d.getVersions() != null && !d.getVersions().isEmpty())
                    .sorted((a, b) -> {
                        Version va = a.getVersions().get(a.getVersions().size() - 1);
                        Version vb = b.getVersions().get(b.getVersions().size() - 1);
                        return vb.getCreatedAt().compareTo(va.getCreatedAt());
                    })
                    .limit(5)
                    .map(doc -> {
                        Version last = doc.getVersions().get(doc.getVersions().size() - 1);
                        return new RecentDocumentResponse(
                                String.valueOf(doc.getId()),
                                doc.getTitle(),
                                last.getStatus().name(),
                                last.getAuthorUsername(),
                                String.valueOf(last.getCreatedAt())
                        );
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(new DashboardResponse(
                    totalUsers,
                    totalDocuments,
                    approved,
                    rejected,
                    draft,
                    pending,
                    recentDocuments
            ));

        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    public static class DashboardResponse {
        private int totalUsers;
        private int totalDocuments;
        private int approvedDocuments;
        private int rejectedDocuments;
        private int draftDocuments;
        private int pendingDocuments;
        private List<RecentDocumentResponse> recentDocuments;

        public DashboardResponse(int totalUsers, int totalDocuments, int approvedDocuments,
                                 int rejectedDocuments, int draftDocuments, int pendingDocuments,
                                 List<RecentDocumentResponse> recentDocuments) {
            this.totalUsers = totalUsers;
            this.totalDocuments = totalDocuments;
            this.approvedDocuments = approvedDocuments;
            this.rejectedDocuments = rejectedDocuments;
            this.draftDocuments = draftDocuments;
            this.pendingDocuments = pendingDocuments;
            this.recentDocuments = recentDocuments;
        }

        public int getTotalUsers() { return totalUsers; }
        public int getTotalDocuments() { return totalDocuments; }
        public int getApprovedDocuments() { return approvedDocuments; }
        public int getRejectedDocuments() { return rejectedDocuments; }
        public int getDraftDocuments() { return draftDocuments; }
        public int getPendingDocuments() { return pendingDocuments; }
        public List<RecentDocumentResponse> getRecentDocuments() { return recentDocuments; }
    }

    public static class RecentDocumentResponse {
        private String id;
        private String title;
        private String status;
        private String author;
        private String updatedAt;

        public RecentDocumentResponse(String id, String title, String status, String author, String updatedAt) {
            this.id = id;
            this.title = title;
            this.status = status;
            this.author = author;
            this.updatedAt = updatedAt;
        }

        public String getId() { return id; }
        public String getTitle() { return title; }
        public String getStatus() { return status; }
        public String getAuthor() { return author; }
        public String getUpdatedAt() { return updatedAt; }
    }
}