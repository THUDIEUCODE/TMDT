package com.example.dacsanmientrung_backend.repository;

import com.example.dacsanmientrung_backend.entity.ChiTietDonHang;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChiTietDonHangRepository extends JpaRepository<ChiTietDonHang, Integer> {

    @EntityGraph(attributePaths = {"bienThe", "bienThe.sanPham"})
    List<ChiTietDonHang> findByDonHang_MaDonHang(Integer maDonHang);

    @EntityGraph(attributePaths = {"donHang", "donHang.nguoiDung", "bienThe", "bienThe.sanPham"})
    Optional<ChiTietDonHang> findByMaChiTietDonHang(Integer maChiTietDonHang);

    @EntityGraph(attributePaths = {"donHang", "donHang.nguoiDung", "bienThe", "bienThe.sanPham"})
    List<ChiTietDonHang> findByBienThe_SanPham_MaSanPhamAndSoSaoIsNotNullAndDaKiemDuyetDanhGiaTrue(Integer maSanPham);

    @EntityGraph(attributePaths = {"donHang", "donHang.nguoiDung", "bienThe", "bienThe.sanPham"})
    List<ChiTietDonHang> findByDonHang_NguoiDung_MaNguoiDungAndSoSaoIsNotNull(Integer maNguoiDung);

    @EntityGraph(attributePaths = {"donHang", "donHang.nguoiDung", "bienThe", "bienThe.sanPham"})
    List<ChiTietDonHang> findBySoSaoIsNotNullOrderByNgayDanhGiaDesc();

    @EntityGraph(attributePaths = {"donHang", "donHang.nguoiDung", "bienThe", "bienThe.sanPham"})
    List<ChiTietDonHang> findBySoSaoIsNotNullAndDaKiemDuyetDanhGiaFalseOrderByNgayDanhGiaDesc();

    @EntityGraph(attributePaths = {"donHang", "donHang.nguoiDung", "bienThe", "bienThe.sanPham"})
    List<ChiTietDonHang> findBySoSaoIsNotNullAndDaKiemDuyetDanhGiaTrueOrderByNgayDanhGiaDesc();

    @EntityGraph(attributePaths = {"bienThe", "bienThe.sanPham", "bienThe.sanPham.danhMuc"})
    List<ChiTietDonHang> findAllByOrderByMaChiTietDonHangAsc();
}
