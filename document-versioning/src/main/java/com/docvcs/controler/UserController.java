package com.docvcs.controler;

import com.docvcs.dto.CreateUserRequest;
import com.docvcs.dto.ErrorResponse;
import com.docvcs.exception.AuthException;
import com.docvcs.model.Role;
import com.docvcs.model.User;
import com.docvcs.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers(@RequestParam String requesterUsername) {
        try {
            User requester = userService.findByUsername(requesterUsername);

            List<UserResponse> users = userService.getAllUsers(requester)
                    .stream()
                    .map(user -> new UserResponse(
                            String.valueOf(user.getId()),
                            user.getUsername(),
                            user.getRole().name()
                    ))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(users);
        } catch (AuthException e) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createUser(
            @RequestBody CreateUserRequest request,
            @RequestParam String requesterUsername
    ) {
        try {
            User requester = userService.findByUsername(requesterUsername);

            User newUser = userService.createUser(
                    request.getUsername(),
                    request.getPassword(),
                    Role.valueOf(request.getRole()),
                    requester
            );

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new UserResponse(
                            String.valueOf(newUser.getId()),
                            newUser.getUsername(),
                            newUser.getRole().name()
                    ));

        } catch (AuthException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Невалидна роля"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id,
            @RequestParam String requesterUsername
    ) {
        try {
            User requester = userService.findByUsername(requesterUsername);
            userService.deleteUser(id, requester);
            return ResponseEntity.ok().build();
        } catch (AuthException e) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<?> changeRole(
            @PathVariable Long id,
            @RequestParam String role,
            @RequestParam String requesterUsername
    ) {
        try {
            User requester = userService.findByUsername(requesterUsername);
            userService.changeRole(id, Role.valueOf(role), requester);
            return ResponseEntity.ok().build();
        } catch (AuthException e) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Invalid role"));
        }
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<?> changePassword(
            @PathVariable Long id,
            @RequestParam String currentPassword,
            @RequestParam String newPassword
    ) {
        try {
            userService.changePassword(id, currentPassword, newPassword);
            return ResponseEntity.ok().build();
        } catch (AuthException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    public static class UserResponse {
        private String id;
        private String username;
        private String role;

        public UserResponse(String id, String username, String role) {
            this.id = id;
            this.username = username;
            this.role = role;
        }

        public String getId() {
            return id;
        }

        public String getUsername() {
            return username;
        }

        public String getRole() {
            return role;
        }
    }
}