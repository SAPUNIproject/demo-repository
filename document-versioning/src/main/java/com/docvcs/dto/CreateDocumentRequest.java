package com.docvcs.dto;

public class CreateDocumentRequest {
    private String title;
    private String description;

    public CreateDocumentRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}