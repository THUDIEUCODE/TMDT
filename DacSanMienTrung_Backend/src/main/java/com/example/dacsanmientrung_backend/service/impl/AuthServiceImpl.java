package com.example.dacsanmientrung_backend.service.impl;

import com.example.dacsanmientrung_backend.dto.request.LoginRequest;
import com.example.dacsanmientrung_backend.dto.request.RegisterRequest;
import com.example.dacsanmientrung_backend.dto.response.LoginResponse;
import com.example.dacsanmientrung_backend.dto.response.UserResponse;
import com.example.dacsanmientrung_backend.entity.NguoiDung;
import com.example.dacsanmientrung_backend.exception.BadRequestException;
import com.example.dacsanmientrung_backend.exception.ResourceNotFoundException;
import com.example.dacsanmientrung_backend.repository.NguoiDungRepository;
import com.example.dacsanmientrung_backend.service.AuthService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthServiceImpl implements AuthService {

    private final NguoiDungRepository nguoiDungRepository;

    public AuthServiceImpl(NguoiDungRepository nguoiDungRepository) {
        this.nguoiDungRepository = nguoiDungRepository;
    }

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (nguoiDungRepository.existsByEmail(email)) {
            throw new BadRequestException("Email đã tồn tại: " + email);
        }

        NguoiDung nguoiDung = new NguoiDung();
        nguoiDung.setHoTen(request.getHoTen().trim());
        nguoiDung.setEmail(email);
        // TODO: Mã hóa mật khẩu bằng BCrypt khi tích hợp Spring Security/JWT.
        nguoiDung.setMatKhau(request.getMatKhau());
        nguoiDung.setSoDienThoai(request.getSoDienThoai());
        nguoiDung.setVaiTro("khachhang");
        nguoiDung.setTrangThai(true);
        nguoiDung.setDiemTichLuy(0);
        nguoiDung.setPhanLoaiKhachHang("thường");
        nguoiDung.setNgayDangKy(LocalDateTime.now());

        return toUserResponse(nguoiDungRepository.save(nguoiDung));
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String email = normalizeEmail(request.getEmail());
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Email hoặc mật khẩu không đúng"));

        if (Boolean.FALSE.equals(nguoiDung.getTrangThai())) {
            throw new BadRequestException("Tài khoản đã bị khóa");
        }

        if (!nguoiDung.getMatKhau().equals(request.getMatKhau())) {
            throw new BadRequestException("Email hoặc mật khẩu không đúng");
        }

        return new LoginResponse("mock-token", toUserResponse(nguoiDung));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Integer id) {
        NguoiDung nguoiDung = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với mã: " + id));
        return toUserResponse(nguoiDung);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        String normalizedEmail = normalizeEmail(email);
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + normalizedEmail));
        return toUserResponse(nguoiDung);
    }

    private UserResponse toUserResponse(NguoiDung nguoiDung) {
        return new UserResponse(
                nguoiDung.getMaNguoiDung(),
                nguoiDung.getHoTen(),
                nguoiDung.getEmail(),
                nguoiDung.getSoDienThoai(),
                nguoiDung.getNgaySinh(),
                nguoiDung.getVaiTro(),
                nguoiDung.getTrangThai(),
                nguoiDung.getDiemTichLuy(),
                nguoiDung.getPhanLoaiKhachHang(),
                nguoiDung.getChucVu(),
                nguoiDung.getNgayDangKy()
        );
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email không được rỗng");
        }
        return email.trim().toLowerCase();
    }
}
