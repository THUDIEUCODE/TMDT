package com.example.dacsanmientrung_backend.repository;

import com.example.dacsanmientrung_backend.entity.DanhMuc;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DanhMucRepository extends JpaRepository<DanhMuc, Integer> {

    List<DanhMuc> findAllByOrderByThuTuHienThiAsc();

    List<DanhMuc> findByTrangThaiTrueOrderByThuTuHienThiAsc();

    List<DanhMuc> findByDanhMucChaIsNullAndTrangThaiTrueOrderByThuTuHienThiAsc();

    List<DanhMuc> findByDanhMucCha_MaDanhMucAndTrangThaiTrueOrderByThuTuHienThiAsc(Integer maDanhMucCha);

    long countByDanhMucCha_MaDanhMucAndTrangThaiTrue(Integer maDanhMucCha);

    Optional<DanhMuc> findByMaDanhMucAndTrangThaiTrue(Integer maDanhMuc);
}
