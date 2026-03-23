package com.docvcs.client;

import java.io.*;
import java.net.Socket;
import java.util.Scanner;

public class DocumentClient {
    private static final String HOST = "localhost";
    private static final int    PORT = 9090;

    public static void main(String[] args) {
        System.out.println("Свързване към сървъра...");

        try (Socket socket = new Socket(HOST, PORT);
             BufferedReader in = new BufferedReader(
                     new InputStreamReader(socket.getInputStream()));
             PrintWriter out = new PrintWriter(
                     new OutputStreamWriter(socket.getOutputStream()), true);
             Scanner scanner = new Scanner(System.in)) {

            // Четем приветствието от сървъра
            readResponse(in);

            // Основен цикъл
            while (true) {
                System.out.print("> ");
                String input = scanner.nextLine().trim();
                if (input.equalsIgnoreCase("EXIT")) {
                    System.out.println("Затваряне...");
                    break;
                }
                if (input.isEmpty()) continue;

                // Изпращаме командата
                out.println(input);

                // Четем отговора до маркера END_OF_RESPONSE
                readResponse(in);
            }

        } catch (IOException e) {
            System.err.println("Не може да се свърже: " + e.getMessage());
            System.err.println("Стартирай сървъра първо!");
        }
    }

    private static void readResponse(BufferedReader in) throws IOException {
        String line;
        while ((line = in.readLine()) != null) {
            if (line.equals("END_OF_RESPONSE")) break;
            System.out.println(line);
        }
    }
}