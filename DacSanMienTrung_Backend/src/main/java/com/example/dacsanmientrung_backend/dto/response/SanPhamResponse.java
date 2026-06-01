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
public class SanPhamResponse {

    private Integer maSanPham;
    private String tenSanPham;
    private String tenDanhMuc;
    private Integer maDanhMuc;
    private String tenTinh;
    private String vungMien;
    private String hinhAnh;
    private BigDecimal giaNiemYet;
    private BigDecimal giaBanThapNhat;
    private Integer tongTonKho;
    private Integer soBienThe;
    private Boolean trangThai;
}
