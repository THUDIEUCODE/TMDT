package com.example.dacsanmientrung_backend.repository;

import com.example.dacsanmientrung_backend.entity.BienThe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BienTheRepository extends JpaRepository<BienThe, Integer> {

    List<BienThe> findBySanPham_MaSanPhamAndTrangThaiTrue(Integer maSanPham);

    Optional<BienThe> findByMaBienTheAndTrangThaiTrue(Integer maBienThe);

    List<BienThe> findTop5ByOrderBySoLuongTonAsc();

    long countBySoLuongTonLessThanEqual(Integer soLuongTon);
}
