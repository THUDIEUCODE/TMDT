package com.example.dacsanmientrung_backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "Voucher")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maVoucher")
    private Integer maVoucher;

    @Column(name = "maCode", nullable = false, unique = true, length = 50)
    private String maCode;

    @Column(name = "loaiGiam", nullable = false, length = 50)
    private String loaiGiam;

    @Column(name = "giaTriGiam", nullable = false, precision = 10, scale = 2)
    private BigDecimal giaTriGiam;

    @Column(name = "donHangToiThieu", nullable = false, precision = 12, scale = 2)
    private BigDecimal donHangToiThieu;

    @Column(name = "soLuongTon", nullable = false)
    private Integer soLuongTon;

    @Column(name = "ngayBatDau")
    private LocalDate ngayBatDau;

    @Column(name = "ngayHetHan", nullable = false)
    private LocalDate ngayHetHan;

    @Column(name = "trangThai", nullable = false)
    private Boolean trangThai;
}
