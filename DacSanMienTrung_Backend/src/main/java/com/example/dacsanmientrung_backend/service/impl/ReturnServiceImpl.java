package com.example.dacsanmientrung_backend.service.impl;

import com.example.dacsanmientrung_backend.dto.request.CreateReturnRequest;
import com.example.dacsanmientrung_backend.dto.request.ProcessReturnRequest;
import com.example.dacsanmientrung_backend.dto.response.ReturnItemResponse;
import com.example.dacsanmientrung_backend.dto.response.ReturnResponse;
import com.example.dacsanmientrung_backend.entity.BienThe;
import com.example.dacsanmientrung_backend.entity.ChiTietDonHang;
import com.example.dacsanmientrung_backend.entity.DonHang;
import com.example.dacsanmientrung_backend.entity.SanPham;
import com.example.dacsanmientrung_backend.exception.BadRequestException;
import com.example.dacsanmientrung_backend.exception.ResourceNotFoundException;
import com.example.dacsanmientrung_backend.repository.BienTheRepository;
import com.example.dacsanmientrung_backend.repository.ChiTietDonHangRepository;
import com.example.dacsanmientrung_backend.repository.DonHangRepository;
import com.example.dacsanmientrung_backend.repository.NguoiDungRepository;
import com.example.dacsanmientrung_backend.service.ReturnService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ReturnServiceImpl implements ReturnService {

    private static final String ORDER_STATUS_DA_GIAO = "daGiao";
    private static final String ORDER_STATUS_DANG_HOAN_HANG = "dangHoanHang";
    private static final String RETURN_KHONG_CO = "khongCo";
    private static final String RETURN_CHO_DUYET = "choDuyet";
    private static final String RETURN_DA_DUYET = "daDuyet";
    private static final String RETURN_TU_CHOI = "tuChoi";
    private static final String RETURN_DA_HOAN_TIEN = "daHoanTien";
    private static final Set<String> VALID_RETURN_STATUSES = Set.of(
            RETURN_KHONG_CO, RETURN_CHO_DUYET, RETURN_DA_DUYET, RETURN_TU_CHOI, RETURN_DA_HOAN_TIEN
    );

    private final DonHangRepository donHangRepository;
    private final ChiTietDonHangRepository chiTietDonHangRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final BienTheRepository bienTheRepository;

    public ReturnServiceImpl(
            DonHangRepository donHangRepository,
            ChiTietDonHangRepository chiTietDonHangRepository,
            NguoiDungRepository nguoiDungRepository,
            BienTheRepository bienTheRepository
    ) {
        this.donHangRepository = donHangRepository;
        this.chiTietDonHangRepository = chiTietDonHangRepository;
        this.nguoiDungRepository = nguoiDungRepository;
        this.bienTheRepository = bienTheRepository;
    }

    @Override
    @Transactional
    public ReturnResponse createReturnRequest(CreateReturnRequest request) {
        DonHang donHang = getOrder(request.getMaDonHang());

        if (!donHang.getNguoiDung().getMaNguoiDung().equals(request.getMaNguoiDung())) {
            throw new BadRequestException("Đơn hàng không thuộc người dùng này");
        }
        if (!ORDER_STATUS_DA_GIAO.equals(donHang.getTrangThaiDonHang())) {
            throw new BadRequestException("Chỉ có thể hoàn hàng với đơn đã giao");
        }
        if (!RETURN_KHONG_CO.equals(donHang.getTrangThaiHoanHang())) {
            throw new BadRequestException("Đơn hàng đã có yêu cầu hoàn hàng");
        }

        List<ChiTietDonHang> orderItems = getOrderItems(donHang.getMaDonHang());
        Map<Integer, ChiTietDonHang> itemMap = orderItems.stream()
                .collect(Collectors.toMap(ChiTietDonHang::getMaChiTietDonHang, Function.identity()));

        for (CreateReturnRequest.Item requestItem : request.getItems()) {
            ChiTietDonHang orderItem = itemMap.get(requestItem.getMaChiTietDonHang());
            if (orderItem == null) {
                throw new ResourceNotFoundException("Không tìm thấy chi tiết đơn hàng với mã: " + requestItem.getMaChiTietDonHang());
            }
            if (requestItem.getSoLuongHoan() > orderItem.getSoLuong()) {
                throw new BadRequestException("Số lượng hoàn vượt quá số lượng đã mua");
            }
            orderItem.setSoLuongHoan(requestItem.getSoLuongHoan());
            orderItem.setDonGiaHoan(orderItem.getDonGia());
            chiTietDonHangRepository.save(orderItem);
        }

        donHang.setLyDoHoanHang(request.getLyDoHoanHang());
        donHang.setHinhAnhMinhChung(request.getHinhAnhMinhChung());
        donHang.setTrangThaiHoanHang(RETURN_CHO_DUYET);
        donHang.setTrangThaiDonHang(ORDER_STATUS_DANG_HOAN_HANG);

        return toResponse(donHangRepository.save(donHang));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReturnResponse> getReturns(String status, String keyword) {
        List<DonHang> orders;
        if (status == null || status.isBlank()) {
            orders = donHangRepository.findByTrangThaiHoanHangNotOrderByNgayDatHangDesc(RETURN_KHONG_CO);
        } else {
            if (!VALID_RETURN_STATUSES.contains(status)) {
                throw new BadRequestException("Trạng thái hoàn hàng không hợp lệ: " + status);
            }
            orders = donHangRepository.findByTrangThaiHoanHangOrderByNgayDatHangDesc(status);
        }

        return orders.stream()
                .filter(order -> matchesKeyword(order, keyword))
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ReturnResponse getReturnByOrderId(Integer maDonHang) {
        DonHang donHang = getOrder(maDonHang);
        ensureReturnExists(donHang);
        return toResponse(donHang);
    }

    @Override
    @Transactional
    public ReturnResponse approveReturn(Integer maDonHang, ProcessReturnRequest request) {
        DonHang donHang = getOrder(maDonHang);
        ensureProcessorExists(request.getMaNhanVienXuLy());
        if (!RETURN_CHO_DUYET.equals(donHang.getTrangThaiHoanHang())) {
            throw new BadRequestException("Chỉ có thể duyệt yêu cầu hoàn hàng đang chờ duyệt");
        }

        getReturnItems(donHang.getMaDonHang()).forEach(item -> {
            BienThe bienThe = item.getBienThe();
            bienThe.setSoLuongTon(bienThe.getSoLuongTon() + item.getSoLuongHoan());
            bienTheRepository.save(bienThe);
        });

        donHang.setTrangThaiHoanHang(RETURN_DA_DUYET);
        donHang.setMaNhanVienXuLy(request.getMaNhanVienXuLy());
        donHang.setGhiChuXuLy(request.getGhiChuXuLy());
        return toResponse(donHangRepository.save(donHang));
    }

    @Override
    @Transactional
    public ReturnResponse rejectReturn(Integer maDonHang, ProcessReturnRequest request) {
        DonHang donHang = getOrder(maDonHang);
        ensureProcessorExists(request.getMaNhanVienXuLy());
        if (!RETURN_CHO_DUYET.equals(donHang.getTrangThaiHoanHang())) {
            throw new BadRequestException("Chỉ có thể từ chối yêu cầu hoàn hàng đang chờ duyệt");
        }

        donHang.setTrangThaiHoanHang(RETURN_TU_CHOI);
        donHang.setMaNhanVienXuLy(request.getMaNhanVienXuLy());
        donHang.setGhiChuXuLy(request.getGhiChuXuLy());
        return toResponse(donHangRepository.save(donHang));
    }

    @Override
    @Transactional
    public ReturnResponse refundReturn(Integer maDonHang, ProcessReturnRequest request) {
        DonHang donHang = getOrder(maDonHang);
        ensureProcessorExists(request.getMaNhanVienXuLy());
        if (!RETURN_DA_DUYET.equals(donHang.getTrangThaiHoanHang())) {
            throw new BadRequestException("Chỉ có thể xác nhận hoàn tiền với yêu cầu đã duyệt");
        }

        donHang.setTrangThaiHoanHang(RETURN_DA_HOAN_TIEN);
        donHang.setMaNhanVienXuLy(request.getMaNhanVienXuLy());
        donHang.setGhiChuXuLy(request.getGhiChuXuLy());
        return toResponse(donHangRepository.save(donHang));
    }

    private ReturnResponse toResponse(DonHang donHang) {
        List<ReturnItemResponse> items = getReturnItems(donHang.getMaDonHang()).stream()
                .map(this::toItemResponse)
                .toList();

        BigDecimal tongTienHoanDuKien = items.stream()
                .map(ReturnItemResponse::getThanhTienHoan)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new ReturnResponse(
                donHang.getMaDonHang(),
                donHang.getNguoiDung().getMaNguoiDung(),
                donHang.getHoTenNguoiNhan(),
                donHang.getSoDienThoaiNguoiNhan(),
                donHang.getDiaChiGiaoHang(),
                donHang.getNgayDatHang(),
                donHang.getTongThanhToan(),
                donHang.getTrangThaiDonHang(),
                donHang.getLyDoHoanHang(),
                donHang.getHinhAnhMinhChung(),
                donHang.getTrangThaiHoanHang(),
                donHang.getMaNhanVienXuLy(),
                donHang.getGhiChuXuLy(),
                tongTienHoanDuKien,
                items
        );
    }

    private ReturnItemResponse toItemResponse(ChiTietDonHang item) {
        BienThe bienThe = item.getBienThe();
        SanPham sanPham = bienThe.getSanPham();
        BigDecimal donGiaHoan = item.getDonGiaHoan() != null ? item.getDonGiaHoan() : item.getDonGia();
        BigDecimal thanhTienHoan = donGiaHoan.multiply(BigDecimal.valueOf(item.getSoLuongHoan()));
        String hinhAnh = bienThe.getHinhAnh() != null ? bienThe.getHinhAnh() : sanPham.getHinhAnh();

        return new ReturnItemResponse(
                item.getMaChiTietDonHang(),
                bienThe.getMaBienThe(),
                sanPham.getMaSanPham(),
                sanPham.getTenSanPham(),
                bienThe.getTrongLuong(),
                bienThe.getQuyCachDongGoi(),
                hinhAnh,
                item.getSoLuong(),
                item.getSoLuongHoan(),
                item.getDonGia(),
                item.getDonGiaHoan(),
                thanhTienHoan
        );
    }

    private DonHang getOrder(Integer maDonHang) {
        return donHangRepository.findByMaDonHang(maDonHang)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với mã: " + maDonHang));
    }

    private List<ChiTietDonHang> getOrderItems(Integer maDonHang) {
        return chiTietDonHangRepository.findByDonHang_MaDonHang(maDonHang);
    }

    private List<ChiTietDonHang> getReturnItems(Integer maDonHang) {
        return getOrderItems(maDonHang).stream()
                .filter(item -> item.getSoLuongHoan() != null && item.getSoLuongHoan() > 0)
                .toList();
    }

    private void ensureReturnExists(DonHang donHang) {
        if (RETURN_KHONG_CO.equals(donHang.getTrangThaiHoanHang())) {
            throw new ResourceNotFoundException("Đơn hàng chưa có yêu cầu hoàn hàng: " + donHang.getMaDonHang());
        }
    }

    private void ensureProcessorExists(Integer maNhanVienXuLy) {
        if (!nguoiDungRepository.existsById(maNhanVienXuLy)) {
            throw new ResourceNotFoundException("Không tìm thấy nhân viên xử lý với mã: " + maNhanVienXuLy);
        }
    }

    private boolean matchesKeyword(DonHang donHang, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }

        String value = keyword.trim().toLowerCase();
        if (String.valueOf(donHang.getMaDonHang()).equals(value)) {
            return true;
        }

        boolean matchesName = donHang.getHoTenNguoiNhan() != null
                && donHang.getHoTenNguoiNhan().toLowerCase().contains(value);
        boolean matchesPhone = donHang.getSoDienThoaiNguoiNhan() != null
                && donHang.getSoDienThoaiNguoiNhan().contains(value);
        return matchesName || matchesPhone;
    }
}
