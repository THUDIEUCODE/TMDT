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
@Table(name = "DonHang")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DonHang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maDonHang")
    private Integer maDonHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maNguoiDung", nullable = false)
    private NguoiDung nguoiDung;

    @Column(name = "maVoucher")
    private Integer maVoucher;

    @Column(name = "maCombo")
    private Integer maCombo;

    @Column(name = "hoTenNguoiNhan", nullable = false, length = 80)
    private String hoTenNguoiNhan;

    @Column(name = "soDienThoaiNguoiNhan", nullable = false, length = 11)
    private String soDienThoaiNguoiNhan;

    @Column(name = "diaChiGiaoHang", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String diaChiGiaoHang;

    @Column(name = "quanHuyen", length = 100)
    private String quanHuyen;

    @Column(name = "tinhThanhGiaoHang", nullable = false, length = 100)
    private String tinhThanhGiaoHang;

    @Column(name = "ghiChuGiaoHang", columnDefinition = "NVARCHAR(MAX)")
    private String ghiChuGiaoHang;

    @Column(name = "trangThaiDonHang", nullable = false, length = 50)
    private String trangThaiDonHang;

    @Column(name = "tongTienHang", nullable = false, precision = 12, scale = 2)
    private BigDecimal tongTienHang;

    @Column(name = "tienGiam", nullable = false, precision = 12, scale = 2)
    private BigDecimal tienGiam;

    @Column(name = "phiVanChuyen", nullable = false, precision = 12, scale = 2)
    private BigDecimal phiVanChuyen;

    @Column(name = "tongThanhToan", nullable = false, precision = 12, scale = 2)
    private BigDecimal tongThanhToan;

    @Column(name = "phuongThucThanhToan", nullable = false, length = 50)
    private String phuongThucThanhToan;

    @Column(name = "trangThaiThanhToan", nullable = false, length = 50)
    private String trangThaiThanhToan;

    @Column(name = "maGiaoDich", length = 100)
    private String maGiaoDich;

    @Column(name = "ngayThanhToan")
    private LocalDateTime ngayThanhToan;

    @Column(name = "lyDoHuy", columnDefinition = "NVARCHAR(MAX)")
    private String lyDoHuy;

    @Column(name = "lyDoHoanHang", columnDefinition = "NVARCHAR(MAX)")
    private String lyDoHoanHang;

    @Column(name = "hinhAnhMinhChung", columnDefinition = "NVARCHAR(MAX)")
    private String hinhAnhMinhChung;

    @Column(name = "trangThaiHoanHang", nullable = false, length = 50)
    private String trangThaiHoanHang;

    @Column(name = "maNhanVienXuLy")
    private Integer maNhanVienXuLy;

    @Column(name = "ghiChuXuLy", columnDefinition = "NVARCHAR(MAX)")
    private String ghiChuXuLy;

    @Column(name = "ngayDatHang", nullable = false)
    private LocalDateTime ngayDatHang;

    @Column(name = "ghiChu", columnDefinition = "NVARCHAR(MAX)")
    private String ghiChu;

    @JsonIgnore
    @OneToMany(mappedBy = "donHang")
    private List<ChiTietDonHang> chiTietDonHangs = new ArrayList<>();
}
