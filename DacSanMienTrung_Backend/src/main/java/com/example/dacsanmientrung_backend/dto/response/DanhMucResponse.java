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
    private Integer thuTuHienThi;
    private Boolean trangThai;
}
