package com.example.dacsanmientrung_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private Integer maDonHang;
    private Integer maNguoiDung;
    private String hoTenNguoiNhan;
    private String soDienThoaiNguoiNhan;
    private LocalDateTime ngayDatHang;
    private String trangThaiDonHang;
    private BigDecimal tongThanhToan;
    private String phuongThucThanhToan;
    private String trangThaiThanhToan;
    private Integer soLuongSanPham;
}
