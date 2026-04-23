DROP DATABASE IF EXISTS document_vcs_new;
CREATE DATABASE document_vcs_new;
USE document_vcs_new;

CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    name VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('AUTHOR', 'REVIEWER', 'READER', 'ADMIN') NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;


CREATE TABLE documents (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    created_by_user_id BIGINT UNSIGNED NOT NULL,
    active_version_id BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT NOT NULL DEFAULT 0,

    PRIMARY KEY (id),
    KEY idx_documents_created_by (created_by_user_id)
) ENGINE=InnoDB;


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

INSERT INTO users (username, email, name, password_hash, role) VALUES
('admin', 'admin@example.com', 'System Administrator', 'admin123', 'ADMIN'),
('ivan', 'ivan@example.com', 'Ivan Petrov', '1234', 'AUTHOR'),
('maria', 'maria@example.com', 'Maria Ivanova', '1234', 'REVIEWER'),
('georgi', 'georgi@example.com', 'Georgi Georgiev', '1234', 'READER');

INSERT INTO documents (title, description, created_by_user_id)
VALUES ('Project Plan', 'Initial project documentation', 2);

INSERT INTO document_versions
(document_id, version_number, title_snapshot, content, author_user_id, status)
VALUES
(1, 1, 'Project Plan v1', 'Initial text of the document', 2, 'APPROVED');

INSERT INTO document_versions
(document_id, version_number, title_snapshot, content, author_user_id, parent_version_id, status)
VALUES
(1, 2, 'Project Plan v2', 'Initial text of the document with improvements', 2, 1, 'PENDING_REVIEW');

INSERT INTO document_versions
(document_id, version_number, title_snapshot, content, author_user_id, parent_version_id, status, review_comment, reviewed_by_user_id)
VALUES
(1, 3, 'Project Plan v3', 'Wrong content example', 2, 2, 'REJECTED', 'Content is not correct', 3);

UPDATE document_versions
SET status = 'APPROVED',
    review_comment = 'Looks good',
    reviewed_by_user_id = 3,
    reviewed_at = NOW()
WHERE id = 2;

UPDATE documents
SET active_version_id = 2
WHERE id = 1;

INSERT INTO version_diffs (old_version_id, new_version_id, diff_text)
VALUES
(1, 2, '+ added improvements to the text');

INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES
(2, 'Created document', 'DOCUMENT', 1, 'Project Plan created'),
(2, 'Created version 1', 'VERSION', 1, 'Initial version'),
(2, 'Created version 2', 'VERSION', 2, 'Updated text'),
(3, 'Approved version', 'VERSION', 2, 'Approved after review'),
(3, 'Rejected version', 'VERSION', 3, 'Incorrect content');
