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
public class ReturnItemResponse {

    private Integer maChiTietDonHang;
    private Integer maBienThe;
    private Integer maSanPham;
    private String tenSanPham;
    private String trongLuong;
    private String quyCachDongGoi;
    private String hinhAnh;
    private Integer soLuong;
    private Integer soLuongHoan;
    private BigDecimal donGia;
    private BigDecimal donGiaHoan;
    private BigDecimal thanhTienHoan;
}
