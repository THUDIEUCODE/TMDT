package com.example.dacsanmientrung_backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DanhMucRequest {

    private Integer maDanhMucCha;
    private String tenDanhMuc;
    private String moTa;
    private String hinhAnh;
    private Integer thuTuHienThi;
    private Boolean trangThai;
}
