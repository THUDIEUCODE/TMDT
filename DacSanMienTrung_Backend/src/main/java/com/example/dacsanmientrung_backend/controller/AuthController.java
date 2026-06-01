package com.example.dacsanmientrung_backend.controller;

import com.example.dacsanmientrung_backend.dto.request.LoginRequest;
import com.example.dacsanmientrung_backend.dto.request.RegisterRequest;
import com.example.dacsanmientrung_backend.dto.response.LoginResponse;
import com.example.dacsanmientrung_backend.dto.response.UserResponse;
import com.example.dacsanmientrung_backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/users/{id}")
    public UserResponse getUserById(@PathVariable Integer id) {
        return authService.getUserById(id);
    }

    @GetMapping("/users/email")
    public UserResponse getUserByEmail(@RequestParam String email) {
        return authService.getUserByEmail(email);
    }
}
