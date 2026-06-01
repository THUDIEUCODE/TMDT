package com.example.dacsanmientrung_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VoucherResponse {

    private Integer maVoucher;
    private String maCode;
    private String loaiGiam;
    private BigDecimal giaTriGiam;
    private BigDecimal donHangToiThieu;
    private Integer soLuongTon;
    private LocalDate ngayBatDau;
    private LocalDate ngayHetHan;
    private Boolean trangThai;
    private Boolean hetHan;
    private Boolean dangHoatDong;
}
