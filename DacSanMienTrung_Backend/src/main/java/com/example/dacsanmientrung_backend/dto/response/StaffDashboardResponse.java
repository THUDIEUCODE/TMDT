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
public class StaffDashboardResponse {

    private Long tongDonHomNay;
    private Long donChoXacNhan;
    private Long donDangGiao;
    private BigDecimal doanhThuHomNay;
    private Long sanPhamSapHetHang;
    private Long yeuCauHoanHangChoXuLy;
    private Long danhGiaChoDuyet;
    private List<RecentOrderResponse> donHangMoiNhat;
    private List<LowStockResponse> canhBaoTonKho;
}
