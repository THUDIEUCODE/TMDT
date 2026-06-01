package com.example.dacsanmientrung_backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateReturnRequest {

    @NotNull(message = "Mã người dùng không được rỗng")
    private Integer maNguoiDung;

    @NotNull(message = "Mã đơn hàng không được rỗng")
    private Integer maDonHang;

    private String lyDoHoanHang;
    private String hinhAnhMinhChung;

    @Valid
    @NotEmpty(message = "Danh sách sản phẩm hoàn không được rỗng")
    private List<Item> items;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {

        @NotNull(message = "Mã chi tiết đơn hàng không được rỗng")
        private Integer maChiTietDonHang;

        @NotNull(message = "Số lượng hoàn không được rỗng")
        @Min(value = 1, message = "Số lượng hoàn phải lớn hơn 0")
        private Integer soLuongHoan;
    }
}
