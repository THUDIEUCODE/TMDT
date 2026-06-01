package com.example.dacsanmientrung_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LowStockResponse {

    private Integer maBienThe;
    private Integer maSanPham;
    private String tenSanPham;
    private String trongLuong;
    private String quyCachDongGoi;
    private Integer soLuongTon;
    private Integer mucCanhBao;
    private String trangThaiCanhBao;
}
