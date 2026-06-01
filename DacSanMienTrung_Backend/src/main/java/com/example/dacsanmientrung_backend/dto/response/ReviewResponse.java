package com.example.dacsanmientrung_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {

    private Integer maChiTietDonHang;
    private Integer maDonHang;
    private Integer maNguoiDung;
    private String hoTenNguoiDung;
    private Integer maSanPham;
    private String tenSanPham;
    private Integer maBienThe;
    private String trongLuong;
    private String quyCachDongGoi;
    private String hinhAnh;
    private Integer soSao;
    private String noiDungDanhGia;
    private LocalDateTime ngayDanhGia;
    private Boolean daKiemDuyetDanhGia;
}
