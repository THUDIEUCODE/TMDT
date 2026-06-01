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
import java.time.LocalDateTime;

@Entity
@Table(name = "ChiTietDonHang")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietDonHang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maChiTietDonHang")
    private Integer maChiTietDonHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maDonHang", nullable = false)
    private DonHang donHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maBienThe", nullable = false)
    private BienThe bienThe;

    @Column(name = "soLuong", nullable = false)
    private Integer soLuong;

    @Column(name = "donGia", nullable = false, precision = 12, scale = 2)
    private BigDecimal donGia;

    @Column(name = "thanhTien", nullable = false, precision = 12, scale = 2)
    private BigDecimal thanhTien;

    @Column(name = "soLuongHoan", nullable = false)
    private Integer soLuongHoan;

    @Column(name = "donGiaHoan", precision = 12, scale = 2)
    private BigDecimal donGiaHoan;

    @Column(name = "soSao")
    private Integer soSao;

    @Column(name = "noiDungDanhGia", columnDefinition = "NVARCHAR(MAX)")
    private String noiDungDanhGia;

    @Column(name = "ngayDanhGia")
    private LocalDateTime ngayDanhGia;

    @Column(name = "daKiemDuyetDanhGia", nullable = false)
    private Boolean daKiemDuyetDanhGia;
}
