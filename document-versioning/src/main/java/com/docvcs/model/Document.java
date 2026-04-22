package com.docvcs.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String createdByUsername;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Version> versions = new ArrayList<>();

    public Document() {}

    public Document(String title, String createdByUsername) {
        this.title = title;
        this.createdByUsername = createdByUsername;
    }

    public Version getActiveVersion() {
        Version active = null;
        for (Version v : versions) {
            if (v.getStatus() == VersionStatus.APPROVED) {
                active = v;
            }
        }
        return active;
    }

    public Version getLatestVersion() {
        if (versions.isEmpty()) return null;
        return versions.get(versions.size() - 1);
    }

    public void addVersion(Version v) {
        v.setDocument(this); // ВАЖНО за JPA
        versions.add(v);
    }

    public Long getId()                { return id; }
    public String getTitle()           { return title; }
    public String getCreatedByUsername(){ return createdByUsername; }
    public List<Version> getVersions() { return versions; }

    public void setId(Long id)         { this.id = id; }
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