package com.example.dacsanmientrung_backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
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
public class CreateComboRequest {

    @NotNull(message = "Mã người dùng không được rỗng")
    private Integer maNguoiDung;

    @NotBlank(message = "Tên combo không được rỗng")
    private String tenCombo;

    @NotBlank(message = "Loại combo không được rỗng")
    private String loaiCombo;

    private String dipLe;
    private String loiNhan;

    @Valid
    private List<ComboItemRequest> items;
}
