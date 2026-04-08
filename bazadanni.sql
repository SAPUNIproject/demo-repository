CREATE DATABASE IF NOT EXISTS document_vcs
USE document_vcs;


-- =========================
-- 1. USERS
CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('AUTHOR', 'REVIEWER', 'READER', 'ADMIN') NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_username (username)
) ENGINE=InnoDB;

-- =========================
-- 2. DOCUMENTS
-- =========================
CREATE TABLE documents (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    created_by_user_id BIGINT UNSIGNED NOT NULL,
    active_version_id BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_documents_created_by (created_by_user_id)
) ENGINE=InnoDB;

-- =========================
-- 3. DOCUMENT VERSIONS
-- =========================
CREATE TABLE document_versions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    document_id BIGINT UNSIGNED NOT NULL,
    version_number INT NOT NULL,
    title_snapshot VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    author_user_id BIGINT UNSIGNED NOT NULL,
    parent_version_id BIGINT UNSIGNED NULL,
    status ENUM('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
    review_comment TEXT NULL,
    reviewed_by_user_id BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_doc_version_number (document_id, version_number),
    KEY idx_versions_document (document_id),
    KEY idx_versions_author (author_user_id),
    KEY idx_versions_status (status),
    KEY idx_versions_reviewer (reviewed_by_user_id),
    KEY idx_versions_parent (parent_version_id)
) ENGINE=InnoDB;

-- =========================
-- 4. AUDIT LOGS
-- =========================
CREATE TABLE audit_logs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NULL,
    action VARCHAR(255) NOT NULL,
    entity_type ENUM('USER', 'DOCUMENT', 'VERSION', 'SYSTEM') NOT NULL,
    entity_id BIGINT UNSIGNED NULL,
    details TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_audit_user (user_id),
    KEY idx_audit_entity (entity_type, entity_id),
    KEY idx_audit_created_at (created_at)
) ENGINE=InnoDB;

-- =========================
-- 5. VERSION DIFFS
-- =========================
CREATE TABLE version_diffs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    old_version_id BIGINT UNSIGNED NOT NULL,
    new_version_id BIGINT UNSIGNED NOT NULL,
    diff_text LONGTEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_version_diff_pair (old_version_id, new_version_id),
    KEY idx_diff_old (old_version_id),
    KEY idx_diff_new (new_version_id)
) ENGINE=InnoDB;

-- =========================
-- FOREIGN KEYS
-- =========================
ALTER TABLE documents
    ADD CONSTRAINT fk_documents_created_by
    FOREIGN KEY (created_by_user_id) REFERENCES users(id);

ALTER TABLE document_versions
    ADD CONSTRAINT fk_versions_document
    FOREIGN KEY (document_id) REFERENCES documents(id)
    ON DELETE CASCADE,
    ADD CONSTRAINT fk_versions_author
    FOREIGN KEY (author_user_id) REFERENCES users(id),
    ADD CONSTRAINT fk_versions_reviewer
    FOREIGN KEY (reviewed_by_user_id) REFERENCES users(id),
    ADD CONSTRAINT fk_versions_parent
    FOREIGN KEY (parent_version_id) REFERENCES document_versions(id);

ALTER TABLE documents
    ADD CONSTRAINT fk_documents_active_version
    FOREIGN KEY (active_version_id) REFERENCES document_versions(id)
    ON DELETE SET NULL;

ALTER TABLE audit_logs
    ADD CONSTRAINT fk_audit_user
    FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE version_diffs
    ADD CONSTRAINT fk_diff_old_version
    FOREIGN KEY (old_version_id) REFERENCES document_versions(id)
    ON DELETE CASCADE,
    ADD CONSTRAINT fk_diff_new_version
    FOREIGN KEY (new_version_id) REFERENCES document_versions(id)
    ON DELETE CASCADE;

-- =========================
-- DEFAULT USERS
-- =========================
INSERT INTO users (username, password_hash, role) VALUES
('admin', 'admin123', 'ADMIN'),
('author1', 'author123', 'AUTHOR'),
('reviewer1', 'reviewer123', 'REVIEWER'),
('reader1', 'reader123', 'READER');