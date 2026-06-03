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

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "DanhMuc")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DanhMuc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maDanhMuc")
    private Integer maDanhMuc;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maDanhMucCha")
    private DanhMuc danhMucCha;

    @Column(name = "tenDanhMuc", nullable = false, length = 80)
    private String tenDanhMuc;

    @Column(name = "moTa", columnDefinition = "NVARCHAR(MAX)")
    private String moTa;

    @Column(name = "hinhAnh", length = 255)
    private String hinhAnh;

    @Column(name = "thuTuHienThi")
    private Integer thuTuHienThi;

    @Column(name = "trangThai", nullable = false)
    private Boolean trangThai;

    @JsonIgnore
    @OneToMany(mappedBy = "danhMucCha")
    private List<DanhMuc> danhMucCon = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "danhMuc")
    private List<SanPham> sanPhams = new ArrayList<>();
}
