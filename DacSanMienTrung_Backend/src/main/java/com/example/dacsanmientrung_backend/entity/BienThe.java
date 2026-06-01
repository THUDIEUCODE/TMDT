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
import java.time.LocalDate;

@Entity
@Table(name = "BienThe")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BienThe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maBienThe")
    private Integer maBienThe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maSanPham", nullable = false)
    private SanPham sanPham;

    @Column(name = "trongLuong", length = 50)
    private String trongLuong;

    @Column(name = "quyCachDongGoi", length = 50)
    private String quyCachDongGoi;

    @Column(name = "giaBan", nullable = false, precision = 12, scale = 2)
    private BigDecimal giaBan;

    @Column(name = "soLuongTon", nullable = false)
    private Integer soLuongTon;

    @Column(name = "hanSuDung")
    private LocalDate hanSuDung;

    @Column(name = "hinhAnh", length = 255)
    private String hinhAnh;

    @Column(name = "trangThai", nullable = false)
    private Boolean trangThai;
}
