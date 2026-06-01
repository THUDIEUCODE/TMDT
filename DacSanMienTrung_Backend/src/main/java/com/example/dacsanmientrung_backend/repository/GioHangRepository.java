package com.example.dacsanmientrung_backend.repository;

import com.example.dacsanmientrung_backend.entity.GioHang;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GioHangRepository extends JpaRepository<GioHang, Integer> {

    @EntityGraph(attributePaths = {"nguoiDung", "bienThe", "bienThe.sanPham"})
    List<GioHang> findByNguoiDung_MaNguoiDung(Integer maNguoiDung);

    @EntityGraph(attributePaths = {"nguoiDung", "bienThe", "bienThe.sanPham"})
    Optional<GioHang> findByNguoiDung_MaNguoiDungAndBienThe_MaBienThe(Integer maNguoiDung, Integer maBienThe);

    void deleteByNguoiDung_MaNguoiDung(Integer maNguoiDung);
}
