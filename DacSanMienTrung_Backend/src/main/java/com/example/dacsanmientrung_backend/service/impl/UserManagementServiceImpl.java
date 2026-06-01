package com.example.dacsanmientrung_backend.service.impl;

import com.example.dacsanmientrung_backend.dto.request.ChangeRoleRequest;
import com.example.dacsanmientrung_backend.dto.request.UserCreateRequest;
import com.example.dacsanmientrung_backend.dto.request.UserUpdateRequest;
import com.example.dacsanmientrung_backend.dto.response.UserResponse;
import com.example.dacsanmientrung_backend.entity.NguoiDung;
import com.example.dacsanmientrung_backend.exception.BadRequestException;
import com.example.dacsanmientrung_backend.exception.ResourceNotFoundException;
import com.example.dacsanmientrung_backend.repository.NguoiDungRepository;
import com.example.dacsanmientrung_backend.service.UserManagementService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class UserManagementServiceImpl implements UserManagementService {

    private static final String ROLE_CUSTOMER = "khachhang";
    private static final Set<String> VALID_ROLES = Set.of("khachhang", "nhanvien", "quantrivien");

    private final NguoiDungRepository nguoiDungRepository;

    public UserManagementServiceImpl(NguoiDungRepository nguoiDungRepository) {
        this.nguoiDungRepository = nguoiDungRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getUsers(String role, String status, String keyword) {
        if (role != null && !role.isBlank()) {
            validateRole(role);
        }

        Boolean statusValue = parseStatus(status);
        return nguoiDungRepository.findAllByOrderByNgayDangKyDesc()
                .stream()
                .filter(user -> role == null || role.isBlank() || role.equals(user.getVaiTro()))
                .filter(user -> statusValue == null || statusValue.equals(user.getTrangThai()))
                .filter(user -> matchesKeyword(user, keyword))
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Integer maNguoiDung) {
        return toResponse(getUser(maNguoiDung));
    }

    @Override
    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (nguoiDungRepository.existsByEmail(email)) {
            throw new BadRequestException("Email đã tồn tại: " + email);
        }

        String role = request.getVaiTro() == null || request.getVaiTro().isBlank() ? ROLE_CUSTOMER : request.getVaiTro().trim();
        validateRole(role);

        NguoiDung user = new NguoiDung();
        user.setHoTen(validateName(request.getHoTen()));
        user.setEmail(email);
        // TODO: Mã hóa mật khẩu bằng BCrypt khi tích hợp Spring Security/JWT.
        user.setMatKhau(request.getMatKhau());
        user.setSoDienThoai(request.getSoDienThoai());
        user.setNgaySinh(request.getNgaySinh());
        user.setVaiTro(role);
        user.setTrangThai(request.getTrangThai() != null ? request.getTrangThai() : true);
        user.setDiemTichLuy(0);
        user.setPhanLoaiKhachHang(resolveCustomerLevel(role, request.getPhanLoaiKhachHang()));
        user.setChucVu(request.getChucVu());
        user.setNgayDangKy(LocalDateTime.now());

        return toResponse(nguoiDungRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse updateUser(Integer maNguoiDung, UserUpdateRequest request) {
        NguoiDung user = getUser(maNguoiDung);
        String role = request.getVaiTro() == null || request.getVaiTro().isBlank() ? user.getVaiTro() : request.getVaiTro().trim();
        validateRole(role);

        user.setHoTen(validateName(request.getHoTen()));
        user.setSoDienThoai(request.getSoDienThoai());
        user.setNgaySinh(request.getNgaySinh());
        user.setVaiTro(role);
        if (request.getTrangThai() != null) {
            user.setTrangThai(request.getTrangThai());
        }
        user.setPhanLoaiKhachHang(resolveCustomerLevel(role, request.getPhanLoaiKhachHang()));
        user.setChucVu(request.getChucVu());

        return toResponse(nguoiDungRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse lockUser(Integer maNguoiDung) {
        NguoiDung user = getUser(maNguoiDung);
        user.setTrangThai(false);
        return toResponse(nguoiDungRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse unlockUser(Integer maNguoiDung) {
        NguoiDung user = getUser(maNguoiDung);
        user.setTrangThai(true);
        return toResponse(nguoiDungRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse changeRole(Integer maNguoiDung, ChangeRoleRequest request) {
        NguoiDung user = getUser(maNguoiDung);
        String role = request.getVaiTro().trim();
        validateRole(role);

        user.setVaiTro(role);
        if (request.getChucVu() != null) {
            user.setChucVu(request.getChucVu());
        }
        user.setPhanLoaiKhachHang(resolveCustomerLevel(role, user.getPhanLoaiKhachHang()));
        return toResponse(nguoiDungRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse deleteUser(Integer maNguoiDung) {
        NguoiDung user = getUser(maNguoiDung);
        user.setTrangThai(false);
        return toResponse(nguoiDungRepository.save(user));
    }

    private NguoiDung getUser(Integer maNguoiDung) {
        return nguoiDungRepository.findById(maNguoiDung)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với mã: " + maNguoiDung));
    }

    private UserResponse toResponse(NguoiDung user) {
        return new UserResponse(
                user.getMaNguoiDung(),
                user.getHoTen(),
                user.getEmail(),
                user.getSoDienThoai(),
                user.getNgaySinh(),
                user.getVaiTro(),
                user.getTrangThai(),
                user.getDiemTichLuy(),
                user.getPhanLoaiKhachHang(),
                user.getChucVu(),
                user.getNgayDangKy()
        );
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email không được rỗng");
        }
        return email.trim().toLowerCase();
    }

    private String validateName(String name) {
        if (name == null || name.isBlank()) {
            throw new BadRequestException("Họ tên không được rỗng");
        }
        return name.trim();
    }

    private void validateRole(String role) {
        if (!VALID_ROLES.contains(role)) {
            throw new BadRequestException("Vai trò không hợp lệ: " + role);
        }
    }

    private Boolean parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        return switch (status.trim().toLowerCase()) {
            case "active" -> true;
            case "locked" -> false;
            default -> throw new BadRequestException("Trạng thái tài khoản không hợp lệ: " + status);
        };
    }

    private String resolveCustomerLevel(String role, String requestedLevel) {
        if (ROLE_CUSTOMER.equals(role)) {
            return requestedLevel == null || requestedLevel.isBlank() ? "thường" : requestedLevel;
        }
        return requestedLevel;
    }

    private boolean matchesKeyword(NguoiDung user, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }
        String value = keyword.trim().toLowerCase();
        return contains(user.getHoTen(), value)
                || contains(user.getEmail(), value)
                || contains(user.getSoDienThoai(), value);
    }

    private boolean contains(String source, String value) {
        return source != null && source.toLowerCase().contains(value);
    }
}
