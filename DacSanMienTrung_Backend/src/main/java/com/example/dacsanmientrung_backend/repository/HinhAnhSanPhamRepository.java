package com.example.dacsanmientrung_backend.repository;

import com.example.dacsanmientrung_backend.entity.HinhAnhSanPham;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HinhAnhSanPhamRepository extends JpaRepository<HinhAnhSanPham, Integer> {

    List<HinhAnhSanPham> findBySanPham_MaSanPhamOrderByThuTuAsc(Integer maSanPham);
}
