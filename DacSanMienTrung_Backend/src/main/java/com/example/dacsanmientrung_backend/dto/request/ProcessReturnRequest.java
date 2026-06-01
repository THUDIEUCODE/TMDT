package com.example.dacsanmientrung_backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProcessReturnRequest {

    @NotNull(message = "Mã nhân viên xử lý không được rỗng")
    private Integer maNhanVienXuLy;

    private String ghiChuXuLy;
}
