package com.example.dacsanmientrung_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateComboRequest {

    @NotBlank(message = "Tên combo không được rỗng")
    private String tenCombo;

    @NotBlank(message = "Loại combo không được rỗng")
    private String loaiCombo;

    private String dipLe;
    private String loiNhan;
}
