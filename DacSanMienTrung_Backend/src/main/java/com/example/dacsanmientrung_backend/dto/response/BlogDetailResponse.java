package com.example.dacsanmientrung_backend.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class BlogDetailResponse extends BlogResponse {

    private String noiDung;
    private List<BlogProductResponse> relatedProducts;

    public BlogDetailResponse(
            Integer maBlog,
            String tieuDe,
            String moTa,
            String hinhAnh,
            String chuDe,
            String tenTinh,
            LocalDateTime ngayDang,
            Boolean trangThai,
            Integer maTacGia,
            String tenTacGia,
            String noiDung,
            List<BlogProductResponse> relatedProducts
    ) {
        super(maBlog, tieuDe, moTa, hinhAnh, chuDe, tenTinh, ngayDang, trangThai, maTacGia, tenTacGia);
        this.noiDung = noiDung;
        this.relatedProducts = relatedProducts;
    }
}
