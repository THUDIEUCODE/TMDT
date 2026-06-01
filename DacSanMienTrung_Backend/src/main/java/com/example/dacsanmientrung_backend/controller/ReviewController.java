package com.example.dacsanmientrung_backend.controller;

import com.example.dacsanmientrung_backend.dto.request.CreateReviewRequest;
import com.example.dacsanmientrung_backend.dto.request.ReviewModerationRequest;
import com.example.dacsanmientrung_backend.dto.response.ReviewResponse;
import com.example.dacsanmientrung_backend.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ReviewResponse createReview(@Valid @RequestBody CreateReviewRequest request) {
        return reviewService.createReview(request);
    }

    @GetMapping("/product/{maSanPham}")
    public List<ReviewResponse> getApprovedReviewsByProduct(@PathVariable Integer maSanPham) {
        return reviewService.getApprovedReviewsByProduct(maSanPham);
    }

    @GetMapping("/user/{maNguoiDung}")
    public List<ReviewResponse> getReviewsByUser(@PathVariable Integer maNguoiDung) {
        return reviewService.getReviewsByUser(maNguoiDung);
    }

    @GetMapping
    public List<ReviewResponse> getReviews(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) String keyword
    ) {
        return reviewService.getReviews(status, rating, keyword);
    }

    @PutMapping("/{maChiTietDonHang}/approve")
    public ReviewResponse approveReview(
            @PathVariable Integer maChiTietDonHang,
            @RequestBody(required = false) ReviewModerationRequest request
    ) {
        return reviewService.approveReview(maChiTietDonHang);
    }

    @PutMapping("/{maChiTietDonHang}/hide")
    public ReviewResponse hideReview(
            @PathVariable Integer maChiTietDonHang,
            @RequestBody(required = false) ReviewModerationRequest request
    ) {
        return reviewService.hideReview(maChiTietDonHang);
    }

    @DeleteMapping("/{maChiTietDonHang}")
    public ReviewResponse deleteReview(@PathVariable Integer maChiTietDonHang) {
        return reviewService.deleteReview(maChiTietDonHang);
    }
}
