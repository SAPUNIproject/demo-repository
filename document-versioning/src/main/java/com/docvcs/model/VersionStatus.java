package com.docvcs.model;

public enum VersionStatus {
    DRAFT,          // чернова, може да се редактира
    PENDING_REVIEW, // изпратена за одобрение
    APPROVED,       // одобрена - може да стане активна
    REJECTED        // отхвърлена - пази се в историята
}