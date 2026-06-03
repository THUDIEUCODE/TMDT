package com.example.dacsanmientrung_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DanhMucResponse {

    private Integer maDanhMuc;
    private Integer maDanhMucCha;
    private String tenDanhMuc;
    private String moTa;
    private String hinhAnh;
    private Integer thuTuHienThi;
    private Boolean trangThai;
    private Integer soSanPham;
    private Integer soDanhMucCon;
}
