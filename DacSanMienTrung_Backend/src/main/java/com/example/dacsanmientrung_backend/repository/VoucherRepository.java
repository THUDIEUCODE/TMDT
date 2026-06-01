package com.example.dacsanmientrung_backend.repository;

import com.example.dacsanmientrung_backend.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VoucherRepository extends JpaRepository<Voucher, Integer> {

    Optional<Voucher> findByMaCode(String maCode);

    boolean existsByMaCode(String maCode);

    List<Voucher> findAllByOrderByNgayHetHanDesc();

    List<Voucher> findByTrangThaiTrueOrderByNgayHetHanAsc();
}
