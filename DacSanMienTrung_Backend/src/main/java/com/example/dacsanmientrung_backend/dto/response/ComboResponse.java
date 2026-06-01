package com.example.dacsanmientrung_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ComboResponse {

    private Integer maCombo;
    private Integer maNguoiDung;
    private String tenNguoiDung;
    private String tenCombo;
    private String loaiCombo;
    private String dipLe;
    private String loiNhan;
    private BigDecimal tongTienTamTinh;
    private String trangThaiCombo;
    private LocalDateTime ngayTao;
    private LocalDateTime ngayCapNhat;
    private Integer soLuongSanPham;
}
