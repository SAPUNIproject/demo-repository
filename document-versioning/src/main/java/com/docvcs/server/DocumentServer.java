package com.docvcs.server;

import com.docvcs.service.DocumentService;
import com.docvcs.service.UserService;
import com.docvcs.storage.JsonStorage;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;

public class DocumentServer {
    public static final int PORT = 9090;

    public static void main(String[] args) {
        JsonStorage storage       = new JsonStorage();
        UserService userService   = new UserService(storage);
        DocumentService docService = new DocumentService(storage);

        System.out.println("Сървърът стартира на порт " + PORT);
        System.out.println("Изчаква клиенти...");

        try (ServerSocket serverSocket = new ServerSocket(PORT)) {
            while (true) {
                Socket clientSocket = serverSocket.accept();
                System.out.println("Нов клиент: "
                        + clientSocket.getInetAddress());
                // Всеки клиент получава собствен Thread
                Thread t = new Thread(
                        new ClientHandler(clientSocket, userService, docService));
                t.start();
            }
        } catch (IOException e) {
            System.err.println("Грешка на сървъра: " + e.getMessage());
        }
    }
}