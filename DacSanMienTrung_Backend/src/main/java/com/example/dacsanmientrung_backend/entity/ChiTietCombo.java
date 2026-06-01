package com.example.dacsanmientrung_backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "ChiTietCombo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietCombo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maChiTietCombo")
    private Integer maChiTietCombo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maCombo", nullable = false)
    private ComboQuaTang comboQuaTang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maBienThe", nullable = false)
    private BienThe bienThe;

    @Column(name = "soLuong", nullable = false)
    private Integer soLuong;

    @Column(name = "donGia", nullable = false, precision = 12, scale = 2)
    private BigDecimal donGia;

    @Column(name = "thanhTien", nullable = false, precision = 12, scale = 2)
    private BigDecimal thanhTien;

    @Column(name = "ghiChuSanPham", columnDefinition = "NVARCHAR(MAX)")
    private String ghiChuSanPham;
}
