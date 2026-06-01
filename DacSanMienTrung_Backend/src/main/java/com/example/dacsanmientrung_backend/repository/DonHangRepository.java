package com.example.dacsanmientrung_backend.repository;

import com.example.dacsanmientrung_backend.entity.DonHang;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DonHangRepository extends JpaRepository<DonHang, Integer> {

    @EntityGraph(attributePaths = {"nguoiDung", "chiTietDonHangs", "chiTietDonHangs.bienThe", "chiTietDonHangs.bienThe.sanPham"})
    List<DonHang> findByNguoiDung_MaNguoiDungOrderByNgayDatHangDesc(Integer maNguoiDung);

    @EntityGraph(attributePaths = {"nguoiDung", "chiTietDonHangs", "chiTietDonHangs.bienThe", "chiTietDonHangs.bienThe.sanPham"})
    List<DonHang> findByTrangThaiDonHangOrderByNgayDatHangDesc(String trangThaiDonHang);

    @EntityGraph(attributePaths = {"nguoiDung", "chiTietDonHangs", "chiTietDonHangs.bienThe", "chiTietDonHangs.bienThe.sanPham"})
    List<DonHang> findAllByOrderByNgayDatHangDesc();

    @EntityGraph(attributePaths = {"nguoiDung"})
    List<DonHang> findTop5ByOrderByNgayDatHangDesc();

    long countByTrangThaiDonHang(String trangThaiDonHang);

    long countByTrangThaiThanhToan(String trangThaiThanhToan);

    @EntityGraph(attributePaths = {"nguoiDung", "chiTietDonHangs", "chiTietDonHangs.bienThe", "chiTietDonHangs.bienThe.sanPham"})
    List<DonHang> findByTrangThaiHoanHangOrderByNgayDatHangDesc(String trangThaiHoanHang);

    @EntityGraph(attributePaths = {"nguoiDung", "chiTietDonHangs", "chiTietDonHangs.bienThe", "chiTietDonHangs.bienThe.sanPham"})
    List<DonHang> findByTrangThaiHoanHangNotOrderByNgayDatHangDesc(String trangThaiHoanHang);

    @EntityGraph(attributePaths = {"nguoiDung", "chiTietDonHangs", "chiTietDonHangs.bienThe", "chiTietDonHangs.bienThe.sanPham"})
    Optional<DonHang> findByMaDonHang(Integer maDonHang);
}
