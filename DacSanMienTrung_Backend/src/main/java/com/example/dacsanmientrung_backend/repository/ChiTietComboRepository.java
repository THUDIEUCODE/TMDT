package com.example.dacsanmientrung_backend.repository;

import com.example.dacsanmientrung_backend.entity.ChiTietCombo;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChiTietComboRepository extends JpaRepository<ChiTietCombo, Integer> {

    @EntityGraph(attributePaths = {"comboQuaTang", "comboQuaTang.nguoiDung", "bienThe", "bienThe.sanPham"})
    List<ChiTietCombo> findByComboQuaTang_MaCombo(Integer maCombo);

    @EntityGraph(attributePaths = {"comboQuaTang", "comboQuaTang.nguoiDung", "bienThe", "bienThe.sanPham"})
    Optional<ChiTietCombo> findByComboQuaTang_MaComboAndBienThe_MaBienThe(Integer maCombo, Integer maBienThe);

    void deleteByComboQuaTang_MaCombo(Integer maCombo);
}
