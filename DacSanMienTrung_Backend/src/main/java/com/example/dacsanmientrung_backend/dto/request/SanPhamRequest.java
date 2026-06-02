package com.example.dacsanmientrung_backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SanPhamRequest {

    private Integer maDanhMuc;
    private String tenSanPham;
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
}
