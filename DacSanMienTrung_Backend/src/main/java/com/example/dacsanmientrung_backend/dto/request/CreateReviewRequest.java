package com.example.dacsanmientrung_backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateReviewRequest {

    @NotNull(message = "Ma nguoi dung khong duoc rong")
    private Integer maNguoiDung;

    @NotNull(message = "Ma chi tiet don hang khong duoc rong")
    private Integer maChiTietDonHang;

    @NotNull(message = "So sao khong duoc rong")
    @Min(value = 1, message = "So sao phai tu 1 den 5")
    @Max(value = 5, message = "So sao phai tu 1 den 5")
    private Integer soSao;

    @NotBlank(message = "Noi dung danh gia khong duoc rong")
    private String noiDungDanhGia;
}
