package com.example.dacsanmientrung_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApplyVoucherResponse {

    private Integer maVoucher;
    private String maCode;
    private String loaiGiam;
    private BigDecimal giaTriGiam;
    private BigDecimal tongTienHang;
    private BigDecimal tienGiam;
    private BigDecimal tongSauGiam;
    private String message;
}
