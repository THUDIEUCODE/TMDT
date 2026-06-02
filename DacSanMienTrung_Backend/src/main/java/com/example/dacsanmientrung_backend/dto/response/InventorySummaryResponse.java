package com.example.dacsanmientrung_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventorySummaryResponse {

    private long tongBienThe;
    private long tongTonKho;
    private long hetHang;
    private long ratThap;
    private long canNhapThem;
    private long conHang;
}
