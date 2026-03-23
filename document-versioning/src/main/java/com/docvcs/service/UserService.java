package com.docvcs.service;

import com.docvcs.exception.AuthException;
import com.docvcs.model.Role;
import com.docvcs.model.User;
import com.docvcs.storage.JsonStorage;

import java.util.List;
import java.util.UUID;

public class UserService {
    private final JsonStorage storage;
    private List<User> users;

    public UserService(JsonStorage storage) {
        this.storage = storage;
        this.users = storage.loadUsers();
        createDefaultAdminIfNeeded();
    }

    // При първо стартиране създай admin потребител
    private void createDefaultAdminIfNeeded() {
        boolean hasAdmin = users.stream()
                .anyMatch(u -> u.getRole() == Role.ADMIN);
        if (!hasAdmin) {
            User admin = new User(UUID.randomUUID().toString(),
                    "admin", "admin123", Role.ADMIN);
            users.add(admin);
            storage.saveUsers(users);
            System.out.println("Създаден default admin: admin / admin123");
        }
    }

    public User login(String username, String password) {
        return users.stream()
                .filter(u -> u.getUsername().equals(username)
                        && u.getPassword().equals(password))
                .findFirst()
                .orElseThrow(() -> new AuthException(
                        "Грешно потребителско име или парола"));
    }

    public User createUser(String username, String password,
                           Role role, User requester) {
        if (requester.getRole() != Role.ADMIN) {
            throw new AuthException("Само администратор може да създава потребители");
        }
        boolean exists = users.stream()
                .anyMatch(u -> u.getUsername().equals(username));
        if (exists) {
            throw new AuthException("Потребителят '" + username + "' вече съществува");
        }
        User newUser = new User(UUID.randomUUID().toString(),
                username, password, role);
        users.add(newUser);
        storage.saveUsers(users);
        return newUser;
    }

    public List<User> getAllUsers(User requester) {
        if (requester.getRole() != Role.ADMIN) {
            throw new AuthException("Само администратор може да вижда всички потребители");
        }
        return users;
    }

    public void reload() {
        this.users = storage.loadUsers();
    }
}