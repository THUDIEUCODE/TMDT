package com.example.dacsanmientrung_backend.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ComboDetailResponse extends ComboResponse {

    private List<ComboItemResponse> items;

    public ComboDetailResponse(
            Integer maCombo,
            Integer maNguoiDung,
            String tenNguoiDung,
            String tenCombo,
            String loaiCombo,
            String dipLe,
            String loiNhan,
            BigDecimal tongTienTamTinh,
            String trangThaiCombo,
            LocalDateTime ngayTao,
            LocalDateTime ngayCapNhat,
            Integer soLuongSanPham,
            List<ComboItemResponse> items
    ) {
        super(maCombo, maNguoiDung, tenNguoiDung, tenCombo, loaiCombo, dipLe, loiNhan,
                tongTienTamTinh, trangThaiCombo, ngayTao, ngayCapNhat, soLuongSanPham);
        this.items = items;
    }
}
