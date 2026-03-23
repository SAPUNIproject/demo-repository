package com.docvcs.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Version {
    private String id;
    private int versionNumber;
    private String content;
    private String authorId;
    private String authorUsername;
    private String createdAt;      // пазим като String за лесно JSON serialize
    private VersionStatus status;
    private String reviewComment;  // коментар от рецензент

    public Version() {}

    public Version(String id, int versionNumber, String content,
                   String authorId, String authorUsername) {
        this.id = id;
        this.versionNumber = versionNumber;
        this.content = content;
        this.authorId = authorId;
        this.authorUsername = authorUsername;
        this.createdAt = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        this.status = VersionStatus.DRAFT;
        this.reviewComment = "";
    }

    // Getters
    public String getId()             { return id; }
    public int getVersionNumber()     { return versionNumber; }
    public String getContent()        { return content; }
    public String getAuthorId()       { return authorId; }
    public String getAuthorUsername() { return authorUsername; }
    public String getCreatedAt()      { return createdAt; }
    public VersionStatus getStatus()  { return status; }
    public String getReviewComment()  { return reviewComment; }

    // Setters
    public void setStatus(VersionStatus status)       { this.status = status; }
    public void setReviewComment(String reviewComment){ this.reviewComment = reviewComment; }
    public void setContent(String content)            { this.content = content; }

    @Override
    public String toString() {
        return String.format("v%d | %s | Автор: %s | Статус: %s | Дата: %s",
                versionNumber, status, authorUsername, status, createdAt);
    }
}