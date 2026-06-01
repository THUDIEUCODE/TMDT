package com.example.dacsanmientrung_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {

    private Integer maGioHang;
    private Integer maNguoiDung;
    private Integer maBienThe;
    private Integer maSanPham;
    private String tenSanPham;
    private String trongLuong;
    private String quyCachDongGoi;
    private String hinhAnh;
    private BigDecimal donGia;
    private Integer soLuong;
    private BigDecimal thanhTien;
    private Integer soLuongTon;
}
