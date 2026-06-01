package com.example.dacsanmientrung_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class VoucherRequest {

    @NotBlank(message = "Mã voucher không được rỗng")
    private String maCode;

    @NotBlank(message = "Loại giảm không được rỗng")
    private String loaiGiam;

    @NotNull(message = "Giá trị giảm không được rỗng")
    private BigDecimal giaTriGiam;

    private BigDecimal donHangToiThieu;

    @NotNull(message = "Số lượng tồn không được rỗng")
    private Integer soLuongTon;

    private LocalDate ngayBatDau;

    @NotNull(message = "Ngày hết hạn không được rỗng")
    private LocalDate ngayHetHan;

    private Boolean trangThai;
}
