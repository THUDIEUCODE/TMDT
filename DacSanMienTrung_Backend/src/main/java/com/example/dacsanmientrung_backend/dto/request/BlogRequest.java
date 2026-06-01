package com.example.dacsanmientrung_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BlogRequest {

    @NotNull(message = "Mã tác giả không được rỗng")
    private Integer maTacGia;

    @NotBlank(message = "Tiêu đề không được rỗng")
    private String tieuDe;

    private String moTa;
    private String noiDung;
    private String hinhAnh;
    private String chuDe;
    private String tenTinh;
    private Boolean trangThai;
    private List<Integer> relatedProductIds;
}
