package com.docvcs.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "versions")
public class Version {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int versionNumber;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String authorId;
    private String authorUsername;

    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private VersionStatus status;

    @Column(columnDefinition = "TEXT")
    private String reviewComment;

    @ManyToOne
    @JoinColumn(name = "document_id")
    private Document document;

    public Version() {}

    public Version(int versionNumber, String content,
                   String authorId, String authorUsername) {
        this.versionNumber = versionNumber;
        this.content = content;
        this.authorId = authorId;
        this.authorUsername = authorUsername;
        this.createdAt = LocalDateTime.now();
        this.status = VersionStatus.DRAFT;
        this.reviewComment = "";
    }

    public Long getId()               { return id; }
    public int getVersionNumber()     { return versionNumber; }
    public String getContent()        { return content; }
    public String getAuthorId()       { return authorId; }
    public String getAuthorUsername() { return authorUsername; }
    public LocalDateTime getCreatedAt(){ return createdAt; }
    public VersionStatus getStatus()  { return status; }
    public String getReviewComment()  { return reviewComment; }
    public Document getDocument()     { return document; }

    public void setStatus(VersionStatus status)        { this.status = status; }
    public void setReviewComment(String reviewComment) { this.reviewComment = reviewComment; }
    public void setContent(String content)             { this.content = content; }
    public void setDocument(Document document)         { this.document = document; }

    @Override
    public String toString() {
        return String.format("v%d | %s | Автор: %s | Дата: %s",
                versionNumber, status, authorUsername, createdAt);
    }
}