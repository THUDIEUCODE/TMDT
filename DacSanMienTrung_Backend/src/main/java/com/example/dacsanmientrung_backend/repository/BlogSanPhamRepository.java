package com.example.dacsanmientrung_backend.repository;

import com.example.dacsanmientrung_backend.entity.BlogSanPham;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BlogSanPhamRepository extends JpaRepository<BlogSanPham, Integer> {

    @EntityGraph(attributePaths = {"sanPham"})
    List<BlogSanPham> findByBlogAmThuc_MaBlog(Integer maBlog);

    void deleteByBlogAmThuc_MaBlog(Integer maBlog);
}
