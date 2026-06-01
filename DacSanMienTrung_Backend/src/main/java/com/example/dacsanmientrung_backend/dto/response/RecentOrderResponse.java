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
public class RecentOrderResponse {

    private Integer maDonHang;
    private String hoTenNguoiNhan;
    private String soDienThoaiNguoiNhan;
    private LocalDateTime ngayDatHang;
    private BigDecimal tongThanhToan;
    private String trangThaiDonHang;
    private String phuongThucThanhToan;
}
