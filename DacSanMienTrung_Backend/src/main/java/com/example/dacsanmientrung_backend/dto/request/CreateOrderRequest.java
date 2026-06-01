package com.example.dacsanmientrung_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    @NotNull(message = "Mã người dùng không được rỗng")
    private Integer maNguoiDung;

    @NotBlank(message = "Họ tên người nhận không được rỗng")
    private String hoTenNguoiNhan;

    @NotBlank(message = "Số điện thoại người nhận không được rỗng")
    private String soDienThoaiNguoiNhan;

    @NotBlank(message = "Địa chỉ giao hàng không được rỗng")
    private String diaChiGiaoHang;

    private String quanHuyen;

    @NotBlank(message = "Tỉnh thành giao hàng không được rỗng")
    private String tinhThanhGiaoHang;

    private String ghiChuGiaoHang;

    @NotBlank(message = "Phương thức thanh toán không được rỗng")
    private String phuongThucThanhToan;

    private Integer maVoucher;
    private BigDecimal phiVanChuyen;
    private String ghiChu;
}
