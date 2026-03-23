package com.docvcs.server;

import com.docvcs.exception.AuthException;
import com.docvcs.exception.DocumentException;
import com.docvcs.model.*;
import com.docvcs.service.DocumentService;
import com.docvcs.service.UserService;

import java.io.*;
import java.net.Socket;
import java.util.List;

public class ClientHandler implements Runnable {
    private final Socket socket;
    private final UserService userService;
    private final DocumentService docService;
    private User currentUser = null;  // null = не е логнат

    public ClientHandler(Socket socket, UserService userService,
                         DocumentService docService) {
        this.socket = socket;
        this.userService = userService;
        this.docService = docService;
    }

    @Override
    public void run() {
        try (BufferedReader in = new BufferedReader(
                new InputStreamReader(socket.getInputStream()));
             PrintWriter out = new PrintWriter(
                     new OutputStreamWriter(socket.getOutputStream()), true)) {

            out.println("Добре дошли в системата за версии на документи!");
            out.println("Въведи: LOGIN <потребител> <парола>");
            out.println("END_OF_RESPONSE");

            String line;
            while ((line = in.readLine()) != null) {
                String response = handleCommand(line.trim());
                // Изпращаме отговора ред по ред, завършва с маркер
                out.println(response);
                out.println("END_OF_RESPONSE");
            }

        } catch (IOException e) {
            System.out.println("Клиент се изключи: " + e.getMessage());
        }
    }

    private String handleCommand(String input) {
        if (input.isEmpty()) return "Въведи команда.";

        // Разделяме командата на части — максимум 3 части
        String[] parts = input.split(" ", 3);
        String cmd = parts[0].toUpperCase();

        try {
            return switch (cmd) {
                case "LOGIN"       -> handleLogin(parts);
                case "HELP"        -> getHelp();
                case "LIST_DOCS"   -> handleListDocs();
                case "CREATE_DOC"  -> handleCreateDoc(parts);
                case "ADD_VERSION" -> handleAddVersion(parts);
                case "SUBMIT"      -> handleSubmit(parts);
                case "APPROVE"     -> handleApprove(parts);
                case "REJECT"      -> handleReject(parts);
                case "HISTORY"     -> handleHistory(parts);
                case "VIEW"        -> handleView(parts);
                case "DIFF"        -> handleDiff(parts);
                case "AUDIT"       -> handleAudit();
                case "LIST_USERS"  -> handleListUsers();
                case "CREATE_USER" -> handleCreateUser(parts);
                case "LOGOUT"      -> handleLogout();
                default -> "Непозната команда. Напиши HELP за списък.";
            };
        } catch (AuthException e) {
            return "ГРЕШКА (права): " + e.getMessage();
        } catch (DocumentException e) {
            return "ГРЕШКА (документ): " + e.getMessage();
        } catch (Exception e) {
            return "ГРЕШКА: " + e.getMessage();
        }
    }

    private String handleLogin(String[] parts) {
        if (parts.length < 3)
            return "Употреба: LOGIN <потребител> <парола>";
        currentUser = userService.login(parts[1], parts[2]);
        return "Влязъл като: " + currentUser.getUsername()
                + " [" + currentUser.getRole() + "]";
    }

    private String handleLogout() {
        requireLogin();
        String name = currentUser.getUsername();
        currentUser = null;
        return "Излязъл. Довиждане, " + name + "!";
    }

    private String handleListDocs() {
        requireLogin();
        docService.reload();
        List<Document> docs = docService.getAllDocuments();
        if (docs.isEmpty()) return "Няма документи.";
        StringBuilder sb = new StringBuilder("Документи:\n");
        for (Document d : docs) {
            sb.append("  ").append(d).append("\n");
        }
        return sb.toString();
    }

    private String handleCreateDoc(String[] parts) {
        requireLogin();
        if (parts.length < 2) return "Употреба: CREATE_DOC <заглавие>";
        // Ако заглавието е в кавички, махаме ги
        String title = parts[1].replace("\"", "");
        if (parts.length == 3) title = title + " " + parts[2].replace("\"", "");
        Document doc = docService.createDocument(title, currentUser);
        return "Създаден документ: " + doc.getId() + " | " + doc.getTitle();
    }

    private String handleAddVersion(String[] parts) {
        requireLogin();
        if (parts.length < 3)
            return "Употреба: ADD_VERSION <docId> <съдържание>";
        Version v = docService.addVersion(parts[1], parts[2], currentUser);
        return "Добавена версия v" + v.getVersionNumber()
                + " (статус: DRAFT). Използвай SUBMIT за изпращане за преглед.";
    }

    private String handleSubmit(String[] parts) {
        requireLogin();
        if (parts.length < 3)
            return "Употреба: SUBMIT <docId> <номер_версия>";
        int vNum = Integer.parseInt(parts[2]);
        docService.submitForReview(parts[1], vNum, currentUser);
        return "Версия v" + vNum + " е изпратена за преглед.";
    }

    private String handleApprove(String[] parts) {
        requireLogin();
        if (parts.length < 3)
            return "Употреба: APPROVE <docId> <номер_версия> [коментар]";
        int vNum = Integer.parseInt(parts[2]);
        // Коментарът е незадължителен
        String comment = parts.length > 2 ? "" : "";
        docService.approveVersion(parts[1], vNum, comment, currentUser);
        return "Версия v" + vNum + " е ОДОБРЕНА.";
    }

    private String handleReject(String[] parts) {
        requireLogin();
        if (parts.length < 3)
            return "Употреба: REJECT <docId> <номер_версия> [коментар]";
        int vNum = Integer.parseInt(parts[2]);
        String comment = parts.length > 2 ? parts[2] : "";
        docService.rejectVersion(parts[1], vNum, comment, currentUser);
        return "Версия v" + vNum + " е ОТХВЪРЛЕНА.";
    }

    private String handleHistory(String[] parts) {
        requireLogin();
        if (parts.length < 2) return "Употреба: HISTORY <docId>";
        List<Version> history = docService.getHistory(parts[1]);
        if (history.isEmpty()) return "Няма версии.";
        StringBuilder sb = new StringBuilder("История:\n");
        for (Version v : history) {
            sb.append("  ").append(v).append("\n");
            if (!v.getReviewComment().isEmpty()) {
                sb.append("    Коментар: ").append(v.getReviewComment()).append("\n");
            }
        }
        return sb.toString();
    }

    private String handleView(String[] parts) {
        requireLogin();
        if (parts.length < 3)
            return "Употреба: VIEW <docId> <номер_версия>";
        List<Version> versions = docService.getHistory(parts[1]);
        int vNum = Integer.parseInt(parts[2]);
        return versions.stream()
                .filter(v -> v.getVersionNumber() == vNum)
                .findFirst()
                .map(v -> "=== v" + v.getVersionNumber() + " ===\n" + v.getContent())
                .orElse("Версията не е намерена.");
    }

    private String handleDiff(String[] parts) {
        requireLogin();
        if (parts.length < 3)
            return "Употреба: DIFF <docId> <версия1> <версия2>";
        String[] nums = parts[2].split(" ");
        if (nums.length < 2) return "Трябват два номера на версии: DIFF <docId> <v1> <v2>";
        int v1 = Integer.parseInt(nums[0]);
        int v2 = Integer.parseInt(nums[1]);
        return docService.diffVersions(parts[1], v1, v2);
    }

    private String handleAudit() {
        requireLogin();
        List<AuditLogEntry> log = docService.getAuditLog(currentUser);
        if (log.isEmpty()) return "Audit log е празен.";
        StringBuilder sb = new StringBuilder("Audit Log:\n");
        for (AuditLogEntry e : log) {
            sb.append("  ").append(e).append("\n");
        }
        return sb.toString();
    }

    private String handleListUsers() {
        requireLogin();
        List<User> users = userService.getAllUsers(currentUser);
        StringBuilder sb = new StringBuilder("Потребители:\n");
        for (User u : users) {
            sb.append("  ").append(u).append("\n");
        }
        return sb.toString();
    }

    private String handleCreateUser(String[] parts) {
        requireLogin();

        if (parts.length < 3) return "Употреба: CREATE_USER <username> <password> <ROLE>";

        String[] rest = parts[2].split(" ");
        if (rest.length < 2) return "Употреба: CREATE_USER <username> <password> <ROLE>";

        String username = parts[1];
        String password = rest[0];
        String roleStr  = rest[1];

        Role role = Role.valueOf(roleStr.toUpperCase());
        User newUser = userService.createUser(username, password, role, currentUser);
        return "Създаден потребител: " + newUser;
    }

    private String getHelp() {
        return """
                === КОМАНДИ ===
                LOGIN <user> <pass>              - Вход в системата
                LOGOUT                           - Изход
                LIST_DOCS                        - Всички документи
                CREATE_DOC <заглавие>            - Нов документ [AUTHOR]
                ADD_VERSION <docId> <текст>      - Нова версия [AUTHOR]
                SUBMIT <docId> <vNum>            - Изпрати за преглед [AUTHOR]
                APPROVE <docId> <vNum>           - Одобри версия [REVIEWER]
                REJECT <docId> <vNum>            - Отхвърли версия [REVIEWER]
                HISTORY <docId>                  - История на версиите
                VIEW <docId> <vNum>              - Съдържание на версия
                DIFF <docId> <vNum1> <vNum2>     - Сравни версии [бонус]
                AUDIT                            - Audit log [ADMIN]
                LIST_USERS                       - Всички потребители [ADMIN]
                CREATE_USER <u> <p> <ROLE>       - Нов потребител [ADMIN]
                HELP                             - Тази помощ
                """;
    }

    private void requireLogin() {
        if (currentUser == null) {
            throw new AuthException("Трябва да влезеш първо. Използвай: LOGIN <user> <pass>");
        }
    }
}