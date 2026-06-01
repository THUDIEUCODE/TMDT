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
public class OrderItemResponse {

    private Integer maChiTietDonHang;
    private Integer maBienThe;
    private Integer maSanPham;
    private String tenSanPham;
    private String trongLuong;
    private String quyCachDongGoi;
    private String hinhAnh;
    private Integer soLuong;
    private BigDecimal donGia;
    private BigDecimal thanhTien;
    private Integer soSao;
    private String noiDungDanhGia;
    private Boolean daKiemDuyetDanhGia;
}
