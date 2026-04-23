package com.docvcs.service;

import com.docvcs.auth.PasswordHasher;
import com.docvcs.exception.AuthException;
import com.docvcs.model.Role;
import com.docvcs.model.User;
import com.docvcs.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        createDefaultAdminIfNeeded();
    }

    private void createDefaultAdminIfNeeded() {
        boolean hasAdmin = userRepository.findAll().stream()
                .anyMatch(u -> u.getRole() == Role.ADMIN);

        if (!hasAdmin) {
            User admin = new User(
                    "admin",
                    PasswordHasher.hash("admin123"),
                    Role.ADMIN
            );
            userRepository.save(admin);
            System.out.println("Създаден default admin: admin / admin123");
        }
    }

    public User login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthException("Грешно потребителско име или парола"));

        if (!PasswordHasher.verify(password, user.getPassword())) {
            throw new AuthException("Грешно потребителско име или парола");
        }

        if (PasswordHasher.needsRehash(user.getPassword())) {
            user.setPassword(PasswordHasher.hash(password));
            userRepository.save(user);
        }

        return user;
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthException("Потребителят '" + username + "' не е намерен"));
    }

    public User register(String username, String password, Role role) {
        if (role == Role.ADMIN) {
            throw new AuthException("Не може да се регистрирате като ADMIN");
        }
        if (username == null || username.isBlank()) {
            throw new AuthException("Потребителското име е задължително");
        }
        if (password == null || password.length() < 8) {
            throw new AuthException("Паролата трябва да е поне 8 символа");
        }

        boolean exists = userRepository.findByUsername(username).isPresent();
        if (exists) {
            throw new AuthException("Потребителят '" + username + "' вече съществува");
        }

        User newUser = new User(
                username,
                PasswordHasher.hash(password),
                role
        );

        return userRepository.save(newUser);
    }

    public User createUser(String username, String password, Role role, User requester) {
        if (requester.getRole() != Role.ADMIN) {
            throw new AuthException("Само администратор може да създава потребители");
        }

        boolean exists = userRepository.findByUsername(username).isPresent();
        if (exists) {
            throw new AuthException("Потребителят '" + username + "' вече съществува");
        }

        User newUser = new User(
                username,
                PasswordHasher.hash(password),
                role
        );
        return userRepository.save(newUser);
    }

    public List<User> getAllUsers(User requester) {
        if (requester.getRole() != Role.ADMIN) {
            throw new AuthException("Само администратор може да вижда всички потребители");
        }
        return userRepository.findAll();
    }

    // ===== НОВИ МЕТОДИ =====

    public void deleteUser(Long id, User requester) {
        if (requester.getRole() != Role.ADMIN) {
            throw new AuthException("Само администратор може да изтрива потребители");
        }

        User userToDelete = userRepository.findById(id)
                .orElseThrow(() -> new AuthException("Потребителят не е намерен"));

        if (userToDelete.getRole() == Role.ADMIN &&
                userToDelete.getUsername().equalsIgnoreCase("admin")) {
            throw new AuthException("Default admin не може да бъде изтрит");
        }

        if (userToDelete.getId().equals(requester.getId())) {
            throw new AuthException("Не може да изтриете собствения си акаунт");
        }

        userRepository.delete(userToDelete);
    }

    public void changeRole(Long id, Role role, User requester) {
        if (requester.getRole() != Role.ADMIN) {
            throw new AuthException("Само администратор може да променя роли");
        }

        User userToUpdate = userRepository.findById(id)
                .orElseThrow(() -> new AuthException("Потребителят не е намерен"));

        if (userToUpdate.getId().equals(requester.getId())) {
            throw new AuthException("Не може да промените собствената си роля");
        }

        userToUpdate.setRole(role);
        userRepository.save(userToUpdate);
    }

    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("Потребителят не е намерен"));

        if (!PasswordHasher.verify(currentPassword, user.getPassword())) {
            throw new AuthException("Грешна текуща парола");
        }

        if (newPassword == null || newPassword.length() < 8) {
            throw new AuthException("Новата парола трябва да е поне 8 символа");
        }

        user.setPassword(PasswordHasher.hash(newPassword));
        userRepository.save(user);
    }

    public void reload() {
    }
}