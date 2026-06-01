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
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "SanPham")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SanPham {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maSanPham")
    private Integer maSanPham;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maDanhMuc", nullable = false)
    private DanhMuc danhMuc;

    @Column(name = "tenSanPham", nullable = false, length = 200)
    private String tenSanPham;

    @Column(name = "moTa", columnDefinition = "NVARCHAR(MAX)")
    private String moTa;

    @Column(name = "thanhPhan", columnDefinition = "NVARCHAR(MAX)")
    private String thanhPhan;

    @Column(name = "huongDanBaoQuan", columnDefinition = "NVARCHAR(MAX)")
    private String huongDanBaoQuan;

    @Column(name = "dacTrungVanHoa", columnDefinition = "NVARCHAR(MAX)")
    private String dacTrungVanHoa;

    @Column(name = "lichSuSanPham", columnDefinition = "NVARCHAR(MAX)")
    private String lichSuSanPham;

    @Column(name = "tenTinh", length = 100)
    private String tenTinh;

    @Column(name = "vungMien", length = 50)
    private String vungMien;

    @Column(name = "moTaVanHoaTinh", columnDefinition = "NVARCHAR(MAX)")
    private String moTaVanHoaTinh;

    @Column(name = "giaNiemYet", nullable = false, precision = 12, scale = 2)
    private BigDecimal giaNiemYet;

    @Column(name = "hinhAnh", length = 255)
    private String hinhAnh;

    @Column(name = "trangThai", nullable = false)
    private Boolean trangThai;

    @JsonIgnore
    @OneToMany(mappedBy = "sanPham")
    private List<BienThe> bienThes = new ArrayList<>();
}
