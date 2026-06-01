package com.example.dacsanmientrung_backend.dto.request;

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
public class AddToCartRequest {

    @NotNull(message = "Mã người dùng không được rỗng")
    private Integer maNguoiDung;

    @NotNull(message = "Mã biến thể không được rỗng")
    private Integer maBienThe;

    @NotNull(message = "Số lượng không được rỗng")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer soLuong;
}
