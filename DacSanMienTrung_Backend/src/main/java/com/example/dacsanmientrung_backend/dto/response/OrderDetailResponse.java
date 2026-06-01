package com.example.dacsanmientrung_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailResponse {

    private Integer maDonHang;
    private Integer maNguoiDung;
    private Integer maVoucher;
    private Integer maCombo;
    private String hoTenNguoiNhan;
    private String soDienThoaiNguoiNhan;
    private String diaChiGiaoHang;
    private String quanHuyen;
    private String tinhThanhGiaoHang;
    private String ghiChuGiaoHang;
    private String trangThaiDonHang;
    private BigDecimal tongTienHang;
    private BigDecimal tienGiam;
    private BigDecimal phiVanChuyen;
    private BigDecimal tongThanhToan;
    private String phuongThucThanhToan;
    private String trangThaiThanhToan;
    private String maGiaoDich;
    private LocalDateTime ngayThanhToan;
    private String lyDoHuy;
    private String lyDoHoanHang;
    private String hinhAnhMinhChung;
    private String trangThaiHoanHang;
    private Integer maNhanVienXuLy;
    private String ghiChuXuLy;
    private LocalDateTime ngayDatHang;
    private String ghiChu;
    private List<OrderItemResponse> items;
}
