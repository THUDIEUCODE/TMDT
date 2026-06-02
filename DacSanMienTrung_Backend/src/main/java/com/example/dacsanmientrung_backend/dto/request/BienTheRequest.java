package com.example.dacsanmientrung_backend.dto.request;

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
public class BienTheRequest {

    private Integer maSanPham;
    private String trongLuong;
    private String quyCachDongGoi;
    private BigDecimal giaBan;
    private Integer soLuongTon;
    private LocalDate hanSuDung;
    private String hinhAnh;
    private Boolean trangThai;
}
