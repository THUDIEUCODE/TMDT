package com.example.dacsanmientrung_backend.controller;

import com.example.dacsanmientrung_backend.dto.request.CreateReviewRequest;
import com.example.dacsanmientrung_backend.dto.response.ReviewResponse;
import com.example.dacsanmientrung_backend.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
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
    public List<ReviewResponse> getReviewsByProduct(@PathVariable Integer maSanPham) {
        return reviewService.getReviewsByProduct(maSanPham);
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
    public ReviewResponse approveReview(@PathVariable Integer maChiTietDonHang) {
        return reviewService.approveReview(maChiTietDonHang);
    }

    @PutMapping("/{maChiTietDonHang}/hide")
    public ReviewResponse hideReview(@PathVariable Integer maChiTietDonHang) {
        return reviewService.hideReview(maChiTietDonHang);
    }

    @DeleteMapping("/{maChiTietDonHang}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteReview(@PathVariable Integer maChiTietDonHang) {
        reviewService.deleteReview(maChiTietDonHang);
    }
}
