package com.example.dacsanmientrung_backend.repository;

import com.example.dacsanmientrung_backend.entity.SanPham;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SanPhamRepository extends JpaRepository<SanPham, Integer> {

    @EntityGraph(attributePaths = {"danhMuc", "bienThes"})
    List<SanPham> findByTrangThaiTrue();

    @EntityGraph(attributePaths = {"danhMuc", "bienThes"})
    List<SanPham> findByDanhMuc_MaDanhMucAndTrangThaiTrue(Integer maDanhMuc);

    long countByDanhMuc_MaDanhMucAndTrangThaiTrue(Integer maDanhMuc);

    @EntityGraph(attributePaths = {"danhMuc", "bienThes"})
    List<SanPham> findByDanhMuc_MaDanhMucInAndTrangThaiTrue(List<Integer> maDanhMucs);

    long countByDanhMuc_MaDanhMucInAndTrangThaiTrue(List<Integer> maDanhMucs);

    @EntityGraph(attributePaths = {"danhMuc", "bienThes"})
    List<SanPham> findByTenSanPhamContainingIgnoreCaseAndTrangThaiTrue(String tenSanPham);

    @EntityGraph(attributePaths = {"danhMuc", "bienThes"})
    Optional<SanPham> findByMaSanPhamAndTrangThaiTrue(Integer maSanPham);
}
