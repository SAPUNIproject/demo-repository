package com.docvcs.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log")
public class AuditLogEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime timestamp;

    private String username;

    @Column(columnDefinition = "TEXT")
    private String action;

    public AuditLogEntry() {}

    public AuditLogEntry(String username, String action) {
        this.timestamp = LocalDateTime.now();
        this.username = username;
        this.action = action;
    }

    public Long getId()            { return id; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public String getUsername()    { return username; }
    public String getAction()      { return action; }

    @Override
    public String toString() {
        return String.format("[%s] %s -> %s", timestamp, username, action);
    }
}