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
            throw new BadRequestException("Chi tiet don hang khong thuoc nguoi dung nay");
        }
        if (!ORDER_STATUS_DA_GIAO.equals(order.getTrangThaiDonHang())) {
            throw new BadRequestException("Chi co the danh gia san pham trong don hang da giao");
        }
        if (request.getSoSao() == null || request.getSoSao() < 1 || request.getSoSao() > 5) {
            throw new BadRequestException("So sao phai tu 1 den 5");
        }
        if (request.getNoiDungDanhGia() == null || request.getNoiDungDanhGia().isBlank()) {
            throw new BadRequestException("Noi dung danh gia khong duoc rong");
        }
        if (item.getSoSao() != null || (item.getNoiDungDanhGia() != null && !item.getNoiDungDanhGia().isBlank())) {
            throw new BadRequestException("San pham trong don hang nay da duoc danh gia");
        }

        item.setSoSao(request.getSoSao());
        item.setNoiDungDanhGia(request.getNoiDungDanhGia().trim());
        item.setNgayDanhGia(LocalDateTime.now());
        item.setDaKiemDuyetDanhGia(false);

        return toResponse(chiTietDonHangRepository.save(item));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByProduct(Integer maSanPham) {
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
            default -> throw new BadRequestException("Trang thai danh gia khong hop le: " + status);
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
    public void deleteReview(Integer maChiTietDonHang) {
        ChiTietDonHang item = getReview(maChiTietDonHang);
        item.setSoSao(null);
        item.setNoiDungDanhGia(null);
        item.setNgayDanhGia(null);
        item.setDaKiemDuyetDanhGia(false);
        chiTietDonHangRepository.save(item);
    }

    private ChiTietDonHang getOrderItem(Integer maChiTietDonHang) {
        return chiTietDonHangRepository.findByMaChiTietDonHang(maChiTietDonHang)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay chi tiet don hang voi ma: " + maChiTietDonHang));
    }

    private ChiTietDonHang getReview(Integer maChiTietDonHang) {
        ChiTietDonHang item = getOrderItem(maChiTietDonHang);
        if (item.getSoSao() == null) {
            throw new ResourceNotFoundException("Khong tim thay danh gia voi ma chi tiet don hang: " + maChiTietDonHang);
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
