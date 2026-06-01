package com.example.dacsanmientrung_backend.service;

import com.example.dacsanmientrung_backend.dto.request.ChangeRoleRequest;
import com.example.dacsanmientrung_backend.dto.request.UserCreateRequest;
import com.example.dacsanmientrung_backend.dto.request.UserUpdateRequest;
import com.example.dacsanmientrung_backend.dto.response.UserResponse;

import java.util.List;

public interface UserManagementService {

    List<UserResponse> getUsers(String role, String status, String keyword);

    UserResponse getUserById(Integer maNguoiDung);

    UserResponse createUser(UserCreateRequest request);

    UserResponse updateUser(Integer maNguoiDung, UserUpdateRequest request);

    UserResponse lockUser(Integer maNguoiDung);

    UserResponse unlockUser(Integer maNguoiDung);

    UserResponse changeRole(Integer maNguoiDung, ChangeRoleRequest request);

    UserResponse deleteUser(Integer maNguoiDung);
}
