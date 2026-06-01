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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "BlogAmThuc")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BlogAmThuc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maBlog")
    private Integer maBlog;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maTacGia", nullable = false)
    private NguoiDung tacGia;

    @Column(name = "tieuDe", nullable = false, length = 200)
    private String tieuDe;

    @Column(name = "moTa", columnDefinition = "NVARCHAR(MAX)")
    private String moTa;

    @Column(name = "noiDung", columnDefinition = "NVARCHAR(MAX)")
    private String noiDung;

    @Column(name = "hinhAnh", length = 255)
    private String hinhAnh;

    @Column(name = "chuDe", length = 100)
    private String chuDe;

    @Column(name = "tenTinh", length = 100)
    private String tenTinh;

    @Column(name = "ngayDang", nullable = false)
    private LocalDateTime ngayDang;

    @Column(name = "trangThai", nullable = false)
    private Boolean trangThai;

    @JsonIgnore
    @OneToMany(mappedBy = "blogAmThuc")
    private List<BlogSanPham> blogSanPhams = new ArrayList<>();
}
