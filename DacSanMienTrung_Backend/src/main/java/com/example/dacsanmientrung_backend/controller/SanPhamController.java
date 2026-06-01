package com.example.dacsanmientrung_backend.controller;

import com.example.dacsanmientrung_backend.dto.response.SanPhamDetailResponse;
import com.example.dacsanmientrung_backend.dto.response.SanPhamResponse;
import com.example.dacsanmientrung_backend.service.SanPhamService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class SanPhamController {

    private final SanPhamService sanPhamService;

    public SanPhamController(SanPhamService sanPhamService) {
        this.sanPhamService = sanPhamService;
    }

    @GetMapping
    public List<SanPhamResponse> getProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String province,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice
    ) {
        return sanPhamService.getProducts(keyword, categoryId, province, minPrice, maxPrice);
    }

    @GetMapping("/{id}")
    public SanPhamDetailResponse getProductById(@PathVariable Integer id) {
        return sanPhamService.getProductById(id);
    }

    @GetMapping("/category/{categoryId}")
    public List<SanPhamResponse> getProductsByCategory(@PathVariable Integer categoryId) {
        return sanPhamService.getProductsByCategory(categoryId);
    }

    @GetMapping("/category-tree/{categoryId}")
    public List<SanPhamResponse> getProductsByCategoryTree(@PathVariable Integer categoryId) {
        return sanPhamService.getProductsByCategoryTree(categoryId);
    }
}
