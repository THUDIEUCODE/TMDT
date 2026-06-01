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
public class ComboItemResponse {

    private Integer maChiTietCombo;
    private Integer maCombo;
    private Integer maBienThe;
    private Integer maSanPham;
    private String tenSanPham;
    private String trongLuong;
    private String quyCachDongGoi;
    private String hinhAnh;
    private Integer soLuong;
    private BigDecimal donGia;
    private BigDecimal thanhTien;
    private String ghiChuSanPham;
}
