package com.example.dacsanmientrung_backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmBankTransferRequest {

    private Integer maNhanVienXuLy;
    private String maGiaoDich;
    private String ghiChuXuLy;
}
