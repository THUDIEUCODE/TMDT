package com.example.dacsanmientrung_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HinhAnhSanPhamResponse {

    private Integer maHinhAnh;
    private Integer maSanPham;
    private String duongDanAnh;
    private Integer thuTu;
}
