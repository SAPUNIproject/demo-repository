package com.docvcs.model;

import java.util.ArrayList;
import java.util.List;

public class Document {
    private String id;
    private String title;
    private String createdByUsername;
    private List<Version> versions;

    public Document() {
        this.versions = new ArrayList<>();
    }

    public Document(String id, String title, String createdByUsername) {
        this.id = id;
        this.title = title;
        this.createdByUsername = createdByUsername;
        this.versions = new ArrayList<>();
    }

    // Връща последната APPROVED версия (активната)
    public Version getActiveVersion() {
        Version active = null;
        for (Version v : versions) {
            if (v.getStatus() == VersionStatus.APPROVED) {
                active = v;  // последната одобрена
            }
        }
        return active;
    }

    // Връща последната версия изобщо
    public Version getLatestVersion() {
        if (versions.isEmpty()) return null;
        return versions.get(versions.size() - 1);
    }

    public void addVersion(Version v) {
        versions.add(v);
    }

    // Getters
    public String getId()                 { return id; }
    public String getTitle()              { return title; }
    public String getCreatedByUsername()  { return createdByUsername; }
    public List<Version> getVersions()    { return versions; }

    // Setters
    public void setId(String id)       { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setVersions(List<Version> versions) { this.versions = versions; }

    @Override
    public String toString() {
        Version active = getActiveVersion();
        return String.format("[%s] %s | Версии: %d | Активна: %s",
                id, title, versions.size(),
                active != null ? "v" + active.getVersionNumber() : "няма");
    }
}