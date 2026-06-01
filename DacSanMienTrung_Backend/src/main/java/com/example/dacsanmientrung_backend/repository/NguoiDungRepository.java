package com.example.dacsanmientrung_backend.repository;

import com.example.dacsanmientrung_backend.entity.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NguoiDungRepository extends JpaRepository<NguoiDung, Integer> {

    Optional<NguoiDung> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByVaiTro(String vaiTro);

    long countByTrangThaiFalse();

    List<NguoiDung> findAllByOrderByNgayDangKyDesc();

    List<NguoiDung> findByVaiTroOrderByNgayDangKyDesc(String vaiTro);

    List<NguoiDung> findByTrangThaiOrderByNgayDangKyDesc(Boolean trangThai);
}
