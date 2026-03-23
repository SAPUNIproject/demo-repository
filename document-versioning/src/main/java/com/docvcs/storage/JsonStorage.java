package com.docvcs.storage;

import com.docvcs.model.AuditLogEntry;
import com.docvcs.model.Document;
import com.docvcs.model.User;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;

import java.io.*;
import java.lang.reflect.Type;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;

public class JsonStorage {

    private static final String DATA_DIR      = "data/";
    private static final String USERS_FILE    = DATA_DIR + "users.json";
    private static final String DOCS_FILE     = DATA_DIR + "documents.json";
    private static final String AUDIT_FILE    = DATA_DIR + "audit_log.json";

    private final Gson gson = new GsonBuilder().setPrettyPrinting().create();

    public JsonStorage() {
        // Създай data/ папката ако не съществува
        try {
            Files.createDirectories(Paths.get(DATA_DIR));
        } catch (IOException e) {
            System.err.println("Грешка при създаване на data/ папка: " + e.getMessage());
        }
    }

    // ---- USERS ----

    public List<User> loadUsers() {
        return loadList(USERS_FILE, new TypeToken<List<User>>(){}.getType());
    }

    public void saveUsers(List<User> users) {
        saveToFile(USERS_FILE, users);
    }

    // ---- DOCUMENTS ----

    public List<Document> loadDocuments() {
        return loadList(DOCS_FILE, new TypeToken<List<Document>>(){}.getType());
    }

    public void saveDocuments(List<Document> documents) {
        saveToFile(DOCS_FILE, documents);
    }

    // ---- AUDIT LOG ----

    public List<AuditLogEntry> loadAuditLog() {
        return loadList(AUDIT_FILE, new TypeToken<List<AuditLogEntry>>(){}.getType());
    }

    public void saveAuditLog(List<AuditLogEntry> log) {
        saveToFile(AUDIT_FILE, log);
    }

    // ---- Помощни методи ----

    private <T> List<T> loadList(String filePath, Type type) {
        File file = new File(filePath);
        if (!file.exists()) return new ArrayList<>();
        try (Reader reader = new FileReader(file)) {
            List<T> result = gson.fromJson(reader, type);
            return result != null ? result : new ArrayList<>();
        } catch (IOException e) {
            System.err.println("Грешка при четене на " + filePath + ": " + e.getMessage());
            return new ArrayList<>();
        }
    }

    private void saveToFile(String filePath, Object data) {
        try (Writer writer = new FileWriter(filePath)) {
            gson.toJson(data, writer);
        } catch (IOException e) {
            System.err.println("Грешка при запис в " + filePath + ": " + e.getMessage());
        }
    }
}