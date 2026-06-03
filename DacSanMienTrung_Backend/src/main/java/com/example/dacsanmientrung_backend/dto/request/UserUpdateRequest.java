package com.example.dacsanmientrung_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {

    @NotBlank(message = "Họ tên không được rỗng")
    private String hoTen;

    @Size(max = 11, message = "Số điện thoại tối đa 11 ký tự")
    private String soDienThoai;

    private String diaChi;
    private LocalDate ngaySinh;
    private String vaiTro;
    private Boolean trangThai;
    private String phanLoaiKhachHang;
    private String chucVu;
}
