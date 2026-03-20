package com.docvcs.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class AuditLogEntry {
    private String timestamp;
    private String username;
    private String action;

    public AuditLogEntry() {}

    public AuditLogEntry(String username, String action) {
        this.timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        this.username = username;
        this.action = action;
    }

    public String getTimestamp() { return timestamp; }
    public String getUsername()  { return username; }
    public String getAction()    { return action; }

    @Override
    public String toString() {
        return String.format("[%s] %s -> %s", timestamp, username, action);
    }
}