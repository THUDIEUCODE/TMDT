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
public class TopProductResponse {

    private Integer maSanPham;
    private String tenSanPham;
    private String tenDanhMuc;
    private Integer soLuongBan;
    private BigDecimal doanhThu;
}
