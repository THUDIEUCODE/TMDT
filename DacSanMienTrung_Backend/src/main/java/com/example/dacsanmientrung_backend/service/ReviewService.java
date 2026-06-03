package com.example.dacsanmientrung_backend.service;

import com.example.dacsanmientrung_backend.dto.request.CreateReviewRequest;
import com.example.dacsanmientrung_backend.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {

    ReviewResponse createReview(CreateReviewRequest request);

    List<ReviewResponse> getReviewsByProduct(Integer maSanPham);

    List<ReviewResponse> getReviewsByUser(Integer maNguoiDung);

    List<ReviewResponse> getReviews(String status, Integer rating, String keyword);

    ReviewResponse approveReview(Integer maChiTietDonHang);

    ReviewResponse hideReview(Integer maChiTietDonHang);

    void deleteReview(Integer maChiTietDonHang);
}
