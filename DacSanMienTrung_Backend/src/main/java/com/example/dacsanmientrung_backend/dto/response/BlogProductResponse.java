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
public class BlogProductResponse {

    private Integer maSanPham;
    private String tenSanPham;
    private String tenTinh;
    private String vungMien;
    private String hinhAnh;
    private BigDecimal giaNiemYet;
}
