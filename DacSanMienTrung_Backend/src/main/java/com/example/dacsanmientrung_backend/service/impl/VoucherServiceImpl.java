package com.example.dacsanmientrung_backend.service.impl;

import com.example.dacsanmientrung_backend.dto.request.ApplyVoucherRequest;
import com.example.dacsanmientrung_backend.dto.request.VoucherRequest;
import com.example.dacsanmientrung_backend.dto.response.ApplyVoucherResponse;
import com.example.dacsanmientrung_backend.dto.response.VoucherResponse;
import com.example.dacsanmientrung_backend.entity.Voucher;
import com.example.dacsanmientrung_backend.exception.BadRequestException;
import com.example.dacsanmientrung_backend.exception.ResourceNotFoundException;
import com.example.dacsanmientrung_backend.repository.VoucherRepository;
import com.example.dacsanmientrung_backend.service.VoucherService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class VoucherServiceImpl implements VoucherService {

    private static final String TYPE_PERCENT = "phanTram";
    private static final String TYPE_AMOUNT = "soTien";

    private final VoucherRepository voucherRepository;

    public VoucherServiceImpl(VoucherRepository voucherRepository) {
        this.voucherRepository = voucherRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<VoucherResponse> getActiveVouchers() {
        return voucherRepository.findByTrangThaiTrueOrderByNgayHetHanAsc()
                .stream()
                .filter(this::isCurrentlyUsable)
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ApplyVoucherResponse applyVoucher(ApplyVoucherRequest request) {
        if (request.getTongTienHang().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Tổng tiền hàng không hợp lệ");
        }

        Voucher voucher = voucherRepository.findByMaCode(normalizeCode(request.getMaCode()))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy voucher: " + request.getMaCode()));

        validateVoucherCanApply(voucher, request.getTongTienHang());
        BigDecimal discount = calculateDiscount(voucher, request.getTongTienHang());
        BigDecimal totalAfterDiscount = request.getTongTienHang().subtract(discount);

        return new ApplyVoucherResponse(
                voucher.getMaVoucher(),
                voucher.getMaCode(),
                voucher.getLoaiGiam(),
                voucher.getGiaTriGiam(),
                request.getTongTienHang(),
                discount,
                totalAfterDiscount,
                "Áp dụng voucher thành công"
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<VoucherResponse> getAllVouchers(String status, String keyword) {
        return voucherRepository.findAllByOrderByNgayHetHanDesc()
                .stream()
                .filter(voucher -> matchesStatus(voucher, status))
                .filter(voucher -> matchesKeyword(voucher, keyword))
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherResponse getVoucherById(Integer maVoucher) {
        return toResponse(getVoucher(maVoucher));
    }

    @Override
    @Transactional
    public VoucherResponse createVoucher(VoucherRequest request) {
        String code = normalizeCode(request.getMaCode());
        if (voucherRepository.existsByMaCode(code)) {
            throw new BadRequestException("Mã voucher đã tồn tại: " + code);
        }

        Voucher voucher = new Voucher();
        voucher.setMaCode(code);
        applyRequest(voucher, request);
        return toResponse(voucherRepository.save(voucher));
    }

    @Override
    @Transactional
    public VoucherResponse updateVoucher(Integer maVoucher, VoucherRequest request) {
        Voucher voucher = getVoucher(maVoucher);
        String code = normalizeCode(request.getMaCode());
        voucherRepository.findByMaCode(code)
                .filter(existing -> !existing.getMaVoucher().equals(maVoucher))
                .ifPresent(existing -> {
                    throw new BadRequestException("Mã voucher đã tồn tại: " + code);
                });

        voucher.setMaCode(code);
        applyRequest(voucher, request);
        return toResponse(voucherRepository.save(voucher));
    }

    @Override
    @Transactional
    public VoucherResponse toggleVoucher(Integer maVoucher) {
        Voucher voucher = getVoucher(maVoucher);
        voucher.setTrangThai(!Boolean.TRUE.equals(voucher.getTrangThai()));
        return toResponse(voucherRepository.save(voucher));
    }

    @Override
    @Transactional
    public VoucherResponse deleteVoucher(Integer maVoucher) {
        Voucher voucher = getVoucher(maVoucher);
        voucher.setTrangThai(false);
        return toResponse(voucherRepository.save(voucher));
    }

    private void applyRequest(Voucher voucher, VoucherRequest request) {
        validateRequest(request);
        voucher.setLoaiGiam(request.getLoaiGiam().trim());
        voucher.setGiaTriGiam(request.getGiaTriGiam());
        voucher.setDonHangToiThieu(request.getDonHangToiThieu() != null ? request.getDonHangToiThieu() : BigDecimal.ZERO);
        voucher.setSoLuongTon(request.getSoLuongTon());
        voucher.setNgayBatDau(request.getNgayBatDau());
        voucher.setNgayHetHan(request.getNgayHetHan());
        voucher.setTrangThai(request.getTrangThai() != null ? request.getTrangThai() : true);
    }

    private void validateRequest(VoucherRequest request) {
        String type = request.getLoaiGiam() != null ? request.getLoaiGiam().trim() : "";
        if (!TYPE_PERCENT.equals(type) && !TYPE_AMOUNT.equals(type)) {
            throw new BadRequestException("Loại giảm chỉ nhận phanTram hoặc soTien");
        }
        if (request.getGiaTriGiam() == null || request.getGiaTriGiam().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Giá trị giảm phải lớn hơn 0");
        }
        if (TYPE_PERCENT.equals(type)
                && (request.getGiaTriGiam().compareTo(BigDecimal.ONE) < 0
                || request.getGiaTriGiam().compareTo(BigDecimal.valueOf(100)) > 0)) {
            throw new BadRequestException("Giá trị giảm phần trăm phải từ 1 đến 100");
        }
        if (request.getDonHangToiThieu() != null && request.getDonHangToiThieu().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Đơn hàng tối thiểu không được âm");
        }
        if (request.getSoLuongTon() == null || request.getSoLuongTon() < 0) {
            throw new BadRequestException("Số lượng tồn phải lớn hơn hoặc bằng 0");
        }
        if (request.getNgayHetHan() == null) {
            throw new BadRequestException("Ngày hết hạn không được rỗng");
        }
        if (request.getNgayBatDau() != null && request.getNgayBatDau().isAfter(request.getNgayHetHan())) {
            throw new BadRequestException("Ngày bắt đầu không được sau ngày hết hạn");
        }
    }

    private void validateVoucherCanApply(Voucher voucher, BigDecimal total) {
        if (!Boolean.TRUE.equals(voucher.getTrangThai())) {
            throw new BadRequestException("Voucher đã bị tắt");
        }
        if (voucher.getSoLuongTon() == null || voucher.getSoLuongTon() <= 0) {
            throw new BadRequestException("Voucher đã hết lượt sử dụng");
        }
        if (isExpired(voucher)) {
            throw new BadRequestException("Voucher đã hết hạn");
        }
        if (voucher.getNgayBatDau() != null && voucher.getNgayBatDau().isAfter(LocalDate.now())) {
            throw new BadRequestException("Voucher chưa đến ngày áp dụng");
        }
        BigDecimal minimum = voucher.getDonHangToiThieu() != null ? voucher.getDonHangToiThieu() : BigDecimal.ZERO;
        if (total.compareTo(minimum) < 0) {
            throw new BadRequestException("Đơn hàng chưa đạt giá trị tối thiểu để áp dụng voucher");
        }
    }

    private BigDecimal calculateDiscount(Voucher voucher, BigDecimal total) {
        BigDecimal discount;
        if (TYPE_PERCENT.equals(voucher.getLoaiGiam())) {
            discount = total.multiply(voucher.getGiaTriGiam())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            discount = voucher.getGiaTriGiam();
        }
        if (discount.compareTo(total) > 0) {
            return total;
        }
        return discount;
    }

    private VoucherResponse toResponse(Voucher voucher) {
        return new VoucherResponse(
                voucher.getMaVoucher(),
                voucher.getMaCode(),
                voucher.getLoaiGiam(),
                voucher.getGiaTriGiam(),
                voucher.getDonHangToiThieu(),
                voucher.getSoLuongTon(),
                voucher.getNgayBatDau(),
                voucher.getNgayHetHan(),
                voucher.getTrangThai(),
                isExpired(voucher),
                isCurrentlyUsable(voucher)
        );
    }

    private Voucher getVoucher(Integer maVoucher) {
        return voucherRepository.findById(maVoucher)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy voucher với mã: " + maVoucher));
    }

    private boolean isCurrentlyUsable(Voucher voucher) {
        LocalDate today = LocalDate.now();
        return Boolean.TRUE.equals(voucher.getTrangThai())
                && voucher.getSoLuongTon() != null
                && voucher.getSoLuongTon() > 0
                && !voucher.getNgayHetHan().isBefore(today)
                && (voucher.getNgayBatDau() == null || !voucher.getNgayBatDau().isAfter(today));
    }

    private boolean isExpired(Voucher voucher) {
        return voucher.getNgayHetHan().isBefore(LocalDate.now());
    }

    private boolean matchesStatus(Voucher voucher, String status) {
        if (status == null || status.isBlank()) {
            return true;
        }
        return switch (status.trim().toLowerCase()) {
            case "active" -> isCurrentlyUsable(voucher);
            case "inactive" -> !Boolean.TRUE.equals(voucher.getTrangThai());
            case "expired" -> isExpired(voucher);
            default -> throw new BadRequestException("Trạng thái voucher không hợp lệ: " + status);
        };
    }

    private boolean matchesKeyword(Voucher voucher, String keyword) {
        return keyword == null
                || keyword.isBlank()
                || voucher.getMaCode().toLowerCase().contains(keyword.trim().toLowerCase());
    }

    private String normalizeCode(String code) {
        if (code == null || code.isBlank()) {
            throw new BadRequestException("Mã voucher không được rỗng");
        }
        return code.trim().toUpperCase();
    }
}
