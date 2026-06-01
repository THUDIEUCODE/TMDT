package com.example.dacsanmientrung_backend.service.impl;

import com.example.dacsanmientrung_backend.dto.request.CreateReviewRequest;
import com.example.dacsanmientrung_backend.dto.response.ReviewResponse;
import com.example.dacsanmientrung_backend.entity.BienThe;
import com.example.dacsanmientrung_backend.entity.ChiTietDonHang;
import com.example.dacsanmientrung_backend.entity.DonHang;
import com.example.dacsanmientrung_backend.entity.NguoiDung;
import com.example.dacsanmientrung_backend.entity.SanPham;
import com.example.dacsanmientrung_backend.exception.BadRequestException;
import com.example.dacsanmientrung_backend.exception.ResourceNotFoundException;
import com.example.dacsanmientrung_backend.repository.ChiTietDonHangRepository;
import com.example.dacsanmientrung_backend.service.ReviewService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReviewServiceImpl implements ReviewService {

    private static final String ORDER_STATUS_DA_GIAO = "daGiao";

    private final ChiTietDonHangRepository chiTietDonHangRepository;

    public ReviewServiceImpl(ChiTietDonHangRepository chiTietDonHangRepository) {
        this.chiTietDonHangRepository = chiTietDonHangRepository;
    }

    @Override
    @Transactional
    public ReviewResponse createReview(CreateReviewRequest request) {
        ChiTietDonHang item = getOrderItem(request.getMaChiTietDonHang());
        DonHang order = item.getDonHang();

        if (!order.getNguoiDung().getMaNguoiDung().equals(request.getMaNguoiDung())) {
            throw new BadRequestException("Chi tiết đơn hàng không thuộc người dùng này");
        }
        if (!ORDER_STATUS_DA_GIAO.equals(order.getTrangThaiDonHang())) {
            throw new BadRequestException("Chỉ có thể đánh giá sản phẩm trong đơn hàng đã giao");
        }
        if (item.getSoSao() != null || (item.getNoiDungDanhGia() != null && !item.getNoiDungDanhGia().isBlank())) {
            throw new BadRequestException("Sản phẩm trong đơn hàng này đã được đánh giá");
        }

        item.setSoSao(request.getSoSao());
        item.setNoiDungDanhGia(request.getNoiDungDanhGia());
        item.setNgayDanhGia(LocalDateTime.now());
        item.setDaKiemDuyetDanhGia(false);

        return toResponse(chiTietDonHangRepository.save(item));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getApprovedReviewsByProduct(Integer maSanPham) {
        return chiTietDonHangRepository
                .findByBienThe_SanPham_MaSanPhamAndSoSaoIsNotNullAndDaKiemDuyetDanhGiaTrue(maSanPham)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByUser(Integer maNguoiDung) {
        return chiTietDonHangRepository.findByDonHang_NguoiDung_MaNguoiDungAndSoSaoIsNotNull(maNguoiDung)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviews(String status, Integer rating, String keyword) {
        List<ChiTietDonHang> reviews = switch (normalizeStatus(status)) {
            case "pending" -> chiTietDonHangRepository.findBySoSaoIsNotNullAndDaKiemDuyetDanhGiaFalseOrderByNgayDanhGiaDesc();
            case "approved" -> chiTietDonHangRepository.findBySoSaoIsNotNullAndDaKiemDuyetDanhGiaTrueOrderByNgayDanhGiaDesc();
            case "" -> chiTietDonHangRepository.findBySoSaoIsNotNullOrderByNgayDanhGiaDesc();
            default -> throw new BadRequestException("Trạng thái đánh giá không hợp lệ: " + status);
        };

        return reviews.stream()
                .filter(review -> matchesRating(review, rating))
                .filter(review -> matchesKeyword(review, keyword))
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ReviewResponse approveReview(Integer maChiTietDonHang) {
        ChiTietDonHang item = getReview(maChiTietDonHang);
        item.setDaKiemDuyetDanhGia(true);
        return toResponse(chiTietDonHangRepository.save(item));
    }

    @Override
    @Transactional
    public ReviewResponse hideReview(Integer maChiTietDonHang) {
        ChiTietDonHang item = getReview(maChiTietDonHang);
        item.setDaKiemDuyetDanhGia(false);
        return toResponse(chiTietDonHangRepository.save(item));
    }

    @Override
    @Transactional
    public ReviewResponse deleteReview(Integer maChiTietDonHang) {
        ChiTietDonHang item = getReview(maChiTietDonHang);
        item.setSoSao(null);
        item.setNoiDungDanhGia(null);
        item.setNgayDanhGia(null);
        item.setDaKiemDuyetDanhGia(false);
        return toResponse(chiTietDonHangRepository.save(item));
    }

    private ChiTietDonHang getOrderItem(Integer maChiTietDonHang) {
        return chiTietDonHangRepository.findByMaChiTietDonHang(maChiTietDonHang)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi tiết đơn hàng với mã: " + maChiTietDonHang));
    }

    private ChiTietDonHang getReview(Integer maChiTietDonHang) {
        ChiTietDonHang item = getOrderItem(maChiTietDonHang);
        if (item.getSoSao() == null) {
            throw new ResourceNotFoundException("Không tìm thấy đánh giá với mã chi tiết đơn hàng: " + maChiTietDonHang);
        }
        return item;
    }

    private ReviewResponse toResponse(ChiTietDonHang item) {
        DonHang order = item.getDonHang();
        NguoiDung user = order.getNguoiDung();
        BienThe variant = item.getBienThe();
        SanPham product = variant.getSanPham();
        String image = variant.getHinhAnh() != null ? variant.getHinhAnh() : product.getHinhAnh();

        return new ReviewResponse(
                item.getMaChiTietDonHang(),
                order.getMaDonHang(),
                user.getMaNguoiDung(),
                user.getHoTen(),
                product.getMaSanPham(),
                product.getTenSanPham(),
                variant.getMaBienThe(),
                variant.getTrongLuong(),
                variant.getQuyCachDongGoi(),
                image,
                item.getSoSao(),
                item.getNoiDungDanhGia(),
                item.getNgayDanhGia(),
                item.getDaKiemDuyetDanhGia()
        );
    }

    private String normalizeStatus(String status) {
        return status == null ? "" : status.trim().toLowerCase();
    }

    private boolean matchesRating(ChiTietDonHang review, Integer rating) {
        return rating == null || rating.equals(review.getSoSao());
    }

    private boolean matchesKeyword(ChiTietDonHang review, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }

        String value = keyword.trim().toLowerCase();
        String productName = review.getBienThe().getSanPham().getTenSanPham();
        String userName = review.getDonHang().getNguoiDung().getHoTen();
        String content = review.getNoiDungDanhGia();

        return (productName != null && productName.toLowerCase().contains(value))
                || (userName != null && userName.toLowerCase().contains(value))
                || (content != null && content.toLowerCase().contains(value));
    }
}
