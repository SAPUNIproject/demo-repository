package com.docvcs.model;

public enum Role {
    AUTHOR,    // създава документи и версии
    REVIEWER,  // одобрява/отхвърля версии
    READER,    // само чете
    ADMIN      // управлява потребители
}