package com.example.dacsanmientrung_backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStockRequest {

    private Integer soLuongTonMoi;
    private String ghiChu;
}
