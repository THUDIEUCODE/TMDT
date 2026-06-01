package com.example.dacsanmientrung_backend.repository;

import com.example.dacsanmientrung_backend.entity.BlogAmThuc;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BlogAmThucRepository extends JpaRepository<BlogAmThuc, Integer> {

    @EntityGraph(attributePaths = {"tacGia"})
    List<BlogAmThuc> findByTrangThaiTrueOrderByNgayDangDesc();

    @EntityGraph(attributePaths = {"tacGia"})
    List<BlogAmThuc> findAllByOrderByNgayDangDesc();

    @EntityGraph(attributePaths = {"tacGia"})
    List<BlogAmThuc> findByChuDeAndTrangThaiTrueOrderByNgayDangDesc(String chuDe);

    @EntityGraph(attributePaths = {"tacGia"})
    List<BlogAmThuc> findByTenTinhAndTrangThaiTrueOrderByNgayDangDesc(String tenTinh);

    @EntityGraph(attributePaths = {"tacGia"})
    Optional<BlogAmThuc> findByMaBlog(Integer maBlog);

    @EntityGraph(attributePaths = {"tacGia"})
    Optional<BlogAmThuc> findByMaBlogAndTrangThaiTrue(Integer maBlog);
}
