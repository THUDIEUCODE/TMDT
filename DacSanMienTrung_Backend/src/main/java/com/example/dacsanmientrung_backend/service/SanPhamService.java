package com.example.dacsanmientrung_backend.service;

import com.example.dacsanmientrung_backend.dto.request.SanPhamRequest;
import com.example.dacsanmientrung_backend.dto.response.SanPhamDetailResponse;
import com.example.dacsanmientrung_backend.dto.response.SanPhamResponse;

import java.math.BigDecimal;
import java.util.List;

public interface SanPhamService {

    List<SanPhamResponse> getProducts(String keyword, Integer categoryId, String province, BigDecimal minPrice, BigDecimal maxPrice);

    List<SanPhamResponse> getManageProducts(String keyword, Integer categoryId, String province, BigDecimal minPrice, BigDecimal maxPrice);

    SanPhamDetailResponse getManageProductById(Integer id);

    SanPhamDetailResponse getProductById(Integer id);

    List<SanPhamResponse> getProductsByCategory(Integer categoryId);

    List<SanPhamResponse> getProductsByCategoryTree(Integer categoryId);

    SanPhamDetailResponse createProduct(SanPhamRequest request);

    SanPhamDetailResponse updateProduct(Integer id, SanPhamRequest request);

    SanPhamDetailResponse toggleProduct(Integer id);

    void softDeleteProduct(Integer id);
}
