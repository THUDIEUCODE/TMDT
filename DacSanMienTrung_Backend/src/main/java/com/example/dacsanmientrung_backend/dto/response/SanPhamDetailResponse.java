package com.example.dacsanmientrung_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SanPhamDetailResponse {

    private Integer maSanPham;
    private String tenSanPham;
    private Integer maDanhMuc;
    private String tenDanhMuc;
    private String moTa;
    private String thanhPhan;
    private String huongDanBaoQuan;
    private String dacTrungVanHoa;
    private String lichSuSanPham;
    private String tenTinh;
    private String vungMien;
    private String moTaVanHoaTinh;
    private BigDecimal giaNiemYet;
    private String hinhAnh;
    private Boolean trangThai;
    private List<BienTheResponse> bienThes;
    private List<HinhAnhSanPhamResponse> hinhAnhs;
}
