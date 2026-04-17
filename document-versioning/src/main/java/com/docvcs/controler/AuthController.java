package com.docvcs.controller;

import com.docvcs.dto.ErrorResponse;
import com.docvcs.dto.LoginRequest;
import com.docvcs.dto.LoginResponse;
import com.docvcs.exception.AuthException;
import com.docvcs.model.User;
import com.docvcs.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = userService.login(request.getUsername(), request.getPassword());

            LoginResponse response = new LoginResponse(
                    user.getId(),
                    user.getUsername(),
                    user.getRole().name()
            );

            return ResponseEntity.ok(response);
        } catch (AuthException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }
}