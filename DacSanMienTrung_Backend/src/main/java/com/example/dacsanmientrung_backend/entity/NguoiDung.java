package com.example.dacsanmientrung_backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "NguoiDung")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NguoiDung {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maNguoiDung")
    private Integer maNguoiDung;

    @Column(name = "hoTen", nullable = false, length = 80)
    private String hoTen;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "matKhau", nullable = false, length = 255)
    private String matKhau;

    @Column(name = "soDienThoai", length = 11)
    private String soDienThoai;

    @Column(name = "ngaySinh")
    private LocalDate ngaySinh;

    @Column(name = "vaiTro", nullable = false, length = 20)
    private String vaiTro;

    @Column(name = "trangThai", nullable = false)
    private Boolean trangThai;

    @Column(name = "diemTichLuy", nullable = false)
    private Integer diemTichLuy;

    @Column(name = "phanLoaiKhachHang", length = 20)
    private String phanLoaiKhachHang;

    @Column(name = "chucVu", length = 100)
    private String chucVu;

    @Column(name = "ngayDangKy", nullable = false)
    private LocalDateTime ngayDangKy;
}
