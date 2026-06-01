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
public class ReturnResponse {

    private Integer maDonHang;
    private Integer maNguoiDung;
    private String hoTenNguoiNhan;
    private String soDienThoaiNguoiNhan;
    private String diaChiGiaoHang;
    private LocalDateTime ngayDatHang;
    private BigDecimal tongThanhToan;
    private String trangThaiDonHang;
    private String lyDoHoanHang;
    private String hinhAnhMinhChung;
    private String trangThaiHoanHang;
    private Integer maNhanVienXuLy;
    private String ghiChuXuLy;
    private BigDecimal tongTienHoanDuKien;
    private List<ReturnItemResponse> items;
}
