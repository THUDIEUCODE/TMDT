package com.example.dacsanmientrung_backend.controller;

import com.example.dacsanmientrung_backend.dto.request.ChangeRoleRequest;
import com.example.dacsanmientrung_backend.dto.request.UserCreateRequest;
import com.example.dacsanmientrung_backend.dto.request.UserUpdateRequest;
import com.example.dacsanmientrung_backend.dto.response.UserResponse;
import com.example.dacsanmientrung_backend.service.UserManagementService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class UserManagementController {

    private final UserManagementService userManagementService;

    public UserManagementController(UserManagementService userManagementService) {
        this.userManagementService = userManagementService;
    }

    @GetMapping
    public List<UserResponse> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword
    ) {
        return userManagementService.getUsers(role, status, keyword);
    }

    @GetMapping("/{maNguoiDung}")
    public UserResponse getUserById(@PathVariable Integer maNguoiDung) {
        return userManagementService.getUserById(maNguoiDung);
    }

    @PostMapping
    public UserResponse createUser(@Valid @RequestBody UserCreateRequest request) {
        return userManagementService.createUser(request);
    }

    @PutMapping("/{maNguoiDung}")
    public UserResponse updateUser(@PathVariable Integer maNguoiDung, @Valid @RequestBody UserUpdateRequest request) {
        return userManagementService.updateUser(maNguoiDung, request);
    }

    @PutMapping("/{maNguoiDung}/lock")
    public UserResponse lockUser(@PathVariable Integer maNguoiDung) {
        return userManagementService.lockUser(maNguoiDung);
    }

    @PutMapping("/{maNguoiDung}/unlock")
    public UserResponse unlockUser(@PathVariable Integer maNguoiDung) {
        return userManagementService.unlockUser(maNguoiDung);
    }

    @PutMapping("/{maNguoiDung}/role")
    public UserResponse changeRole(@PathVariable Integer maNguoiDung, @Valid @RequestBody ChangeRoleRequest request) {
        return userManagementService.changeRole(maNguoiDung, request);
    }

    @DeleteMapping("/{maNguoiDung}")
    public UserResponse deleteUser(@PathVariable Integer maNguoiDung) {
        return userManagementService.deleteUser(maNguoiDung);
    }
}
