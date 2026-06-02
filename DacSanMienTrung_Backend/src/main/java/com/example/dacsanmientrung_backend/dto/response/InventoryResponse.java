package com.example.dacsanmientrung_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryResponse {

    private Integer maBienThe;
    private Integer maSanPham;
    private String tenSanPham;
    private Integer maDanhMuc;
    private String tenDanhMuc;
    private String tenTinh;
    private String vungMien;
    private String hinhAnhSanPham;
    private String hinhAnhBienThe;
    private String trongLuong;
    private String quyCachDongGoi;
    private BigDecimal giaBan;
    private Integer soLuongTon;
    private LocalDate hanSuDung;
    private Boolean trangThaiBienThe;
    private String trangThaiTonKho;
    private String nhanTrangThaiTonKho;
}
