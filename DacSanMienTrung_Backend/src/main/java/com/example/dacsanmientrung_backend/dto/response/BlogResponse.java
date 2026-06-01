package com.example.dacsanmientrung_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BlogResponse {

    private Integer maBlog;
    private String tieuDe;
    private String moTa;
    private String hinhAnh;
    private String chuDe;
    private String tenTinh;
    private LocalDateTime ngayDang;
    private Boolean trangThai;
    private Integer maTacGia;
    private String tenTacGia;
}
