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

@Entity
@Table(name = "HinhAnhSanPham")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HinhAnhSanPham {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maHinhAnh")
    private Integer maHinhAnh;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maSanPham", nullable = false)
    private SanPham sanPham;

    @Column(name = "duongDanAnh", nullable = false, length = 255)
    private String duongDanAnh;

    @Column(name = "thuTu")
    private Integer thuTu;
}
