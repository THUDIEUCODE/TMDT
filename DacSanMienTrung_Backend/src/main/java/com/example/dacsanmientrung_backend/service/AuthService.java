package com.example.dacsanmientrung_backend.service;

import com.example.dacsanmientrung_backend.dto.request.LoginRequest;
import com.example.dacsanmientrung_backend.dto.request.RegisterRequest;
import com.example.dacsanmientrung_backend.dto.response.LoginResponse;
import com.example.dacsanmientrung_backend.dto.response.UserResponse;

public interface AuthService {

    UserResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    UserResponse getUserById(Integer id);

    UserResponse getUserByEmail(String email);
}
