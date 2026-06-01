package com.example.dacsanmientrung_backend.repository;

import com.example.dacsanmientrung_backend.entity.ComboQuaTang;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ComboQuaTangRepository extends JpaRepository<ComboQuaTang, Integer> {

    @EntityGraph(attributePaths = {"nguoiDung"})
    List<ComboQuaTang> findByNguoiDung_MaNguoiDungOrderByNgayTaoDesc(Integer maNguoiDung);

    @EntityGraph(attributePaths = {"nguoiDung"})
    List<ComboQuaTang> findByNguoiDung_MaNguoiDungAndTrangThaiComboOrderByNgayTaoDesc(Integer maNguoiDung, String trangThaiCombo);

    @EntityGraph(attributePaths = {"nguoiDung"})
    List<ComboQuaTang> findAllByOrderByNgayTaoDesc();

    @EntityGraph(attributePaths = {"nguoiDung"})
    List<ComboQuaTang> findByTrangThaiComboOrderByNgayTaoDesc(String trangThaiCombo);

    @EntityGraph(attributePaths = {"nguoiDung"})
    Optional<ComboQuaTang> findByMaCombo(Integer maCombo);
}
