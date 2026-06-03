package com.example.dacsanmientrung_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Integer maNguoiDung;
    private String hoTen;
    private String email;
    private String soDienThoai;
    private String diaChi;
    private LocalDate ngaySinh;
    private String vaiTro;
    private Boolean trangThai;
    private Integer diemTichLuy;
    private String phanLoaiKhachHang;
    private String chucVu;
    private LocalDateTime ngayDangKy;
}
