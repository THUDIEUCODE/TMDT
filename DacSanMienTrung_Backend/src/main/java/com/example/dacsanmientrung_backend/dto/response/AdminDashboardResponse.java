package com.example.dacsanmientrung_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {

    private BigDecimal tongDoanhThu;
    private Long tongDonHang;
    private Long tongKhachHang;
    private Long tongSanPham;
    private Long donChoXuLy;
    private Long voucherDangHoatDong;
    private BigDecimal doanhThuThangNay;
    private Long taiKhoanBiKhoa;
    private List<RevenueByDayResponse> doanhThu7NgayGanNhat;
    private List<OrderStatusStatResponse> donHangTheoTrangThai;
    private List<TopProductResponse> topSanPhamBanChay;
    private List<RecentOrderResponse> donHangGanDay;
    private List<LowStockResponse> canhBaoTonKho;
}
