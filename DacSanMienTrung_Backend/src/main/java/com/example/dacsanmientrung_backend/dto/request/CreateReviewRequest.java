package com.example.dacsanmientrung_backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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

    @NotNull(message = "Mã người dùng không được rỗng")
    private Integer maNguoiDung;

    @NotNull(message = "Mã chi tiết đơn hàng không được rỗng")
    private Integer maChiTietDonHang;

    @NotNull(message = "Số sao không được rỗng")
    @Min(value = 1, message = "Số sao phải từ 1 đến 5")
    @Max(value = 5, message = "Số sao phải từ 1 đến 5")
    private Integer soSao;

    private String noiDungDanhGia;
}
