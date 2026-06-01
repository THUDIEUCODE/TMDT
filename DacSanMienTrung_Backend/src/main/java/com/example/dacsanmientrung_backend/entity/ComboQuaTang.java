package com.example.dacsanmientrung_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ComboQuaTang")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ComboQuaTang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maCombo")
    private Integer maCombo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maNguoiDung", nullable = false)
    private NguoiDung nguoiDung;

    @Column(name = "tenCombo", nullable = false, length = 100)
    private String tenCombo;

    @Column(name = "loaiCombo", nullable = false, length = 50)
    private String loaiCombo;

    @Column(name = "dipLe", length = 100)
    private String dipLe;

    @Column(name = "loiNhan", columnDefinition = "NVARCHAR(MAX)")
    private String loiNhan;

    @Column(name = "tongTienTamTinh", nullable = false, precision = 12, scale = 2)
    private BigDecimal tongTienTamTinh;

    @Column(name = "trangThaiCombo", nullable = false, length = 30)
    private String trangThaiCombo;

    @Column(name = "ngayTao", nullable = false)
    private LocalDateTime ngayTao;

    @Column(name = "ngayCapNhat")
    private LocalDateTime ngayCapNhat;

    @JsonIgnore
    @OneToMany(mappedBy = "comboQuaTang")
    private List<ChiTietCombo> chiTietCombos = new ArrayList<>();
}
