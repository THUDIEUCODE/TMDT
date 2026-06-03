package com.example.dacsanmientrung_backend.service.impl;

import com.example.dacsanmientrung_backend.dto.request.CancelOrderRequest;
import com.example.dacsanmientrung_backend.dto.request.ConfirmBankTransferRequest;
import com.example.dacsanmientrung_backend.dto.request.ConfirmReceivedRequest;
import com.example.dacsanmientrung_backend.dto.request.ConfirmWalletPaymentRequest;
import com.example.dacsanmientrung_backend.dto.request.CreateOrderRequest;
import com.example.dacsanmientrung_backend.dto.response.OrderDetailResponse;
import com.example.dacsanmientrung_backend.dto.response.OrderItemResponse;
import com.example.dacsanmientrung_backend.dto.response.OrderResponse;
import com.example.dacsanmientrung_backend.entity.BienThe;
import com.example.dacsanmientrung_backend.entity.ChiTietDonHang;
import com.example.dacsanmientrung_backend.entity.DonHang;
import com.example.dacsanmientrung_backend.entity.GioHang;
import com.example.dacsanmientrung_backend.entity.NguoiDung;
import com.example.dacsanmientrung_backend.entity.SanPham;
import com.example.dacsanmientrung_backend.entity.Voucher;
import com.example.dacsanmientrung_backend.exception.BadRequestException;
import com.example.dacsanmientrung_backend.exception.ResourceNotFoundException;
import com.example.dacsanmientrung_backend.repository.BienTheRepository;
import com.example.dacsanmientrung_backend.repository.ChiTietDonHangRepository;
import com.example.dacsanmientrung_backend.repository.DonHangRepository;
import com.example.dacsanmientrung_backend.repository.GioHangRepository;
import com.example.dacsanmientrung_backend.repository.NguoiDungRepository;
import com.example.dacsanmientrung_backend.repository.VoucherRepository;
import com.example.dacsanmientrung_backend.service.DonHangService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class DonHangServiceImpl implements DonHangService {

    private static final String STATUS_CHO_XAC_NHAN = "choXacNhan";
    private static final String STATUS_DA_XAC_NHAN = "daXacNhan";
    private static final String STATUS_DANG_GIAO = "dangGiao";
    private static final String STATUS_KHACH_DA_NHAN = "khachDaNhan";
    private static final String STATUS_DA_GIAO = "daGiao";
    private static final String STATUS_DA_HUY = "daHuy";
    private static final String STATUS_DANG_HOAN_HANG = "dangHoanHang";
    private static final String PAYMENT_STATUS_CHO_THANH_TOAN = "choThanhToan";
    private static final String PAYMENT_STATUS_THANH_CONG = "thanhCong";
    private static final String PAYMENT_COD = "COD";
    private static final String PAYMENT_CHUYEN_KHOAN = "chuyenKhoan";
    private static final String PAYMENT_VI = "vi";
    private static final String VOUCHER_TYPE_PERCENT = "phanTram";
    private static final String VOUCHER_TYPE_AMOUNT = "soTien";
    private static final Set<String> VALID_ORDER_STATUSES = Set.of(
            STATUS_CHO_XAC_NHAN,
            STATUS_DA_XAC_NHAN,
            STATUS_DANG_GIAO,
            STATUS_KHACH_DA_NHAN,
            STATUS_DA_GIAO,
            STATUS_DA_HUY,
            STATUS_DANG_HOAN_HANG
    );
    private static final Set<String> PREPAID_PAYMENT_METHODS = Set.of(PAYMENT_CHUYEN_KHOAN, PAYMENT_VI);

    private final DonHangRepository donHangRepository;
    private final ChiTietDonHangRepository chiTietDonHangRepository;
    private final GioHangRepository gioHangRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final BienTheRepository bienTheRepository;
    private final VoucherRepository voucherRepository;

    public DonHangServiceImpl(
            DonHangRepository donHangRepository,
            ChiTietDonHangRepository chiTietDonHangRepository,
            GioHangRepository gioHangRepository,
            NguoiDungRepository nguoiDungRepository,
            BienTheRepository bienTheRepository,
            VoucherRepository voucherRepository
    ) {
        this.donHangRepository = donHangRepository;
        this.chiTietDonHangRepository = chiTietDonHangRepository;
        this.gioHangRepository = gioHangRepository;
        this.nguoiDungRepository = nguoiDungRepository;
        this.bienTheRepository = bienTheRepository;
        this.voucherRepository = voucherRepository;
    }

    @Override
    @Transactional
    public OrderDetailResponse createOrder(CreateOrderRequest request) {
        NguoiDung nguoiDung = getUser(request.getMaNguoiDung());
        List<GioHang> cartItems = gioHangRepository.findByNguoiDung_MaNguoiDung(request.getMaNguoiDung());
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Giỏ hàng đang trống");
        }

        cartItems.forEach(item -> validateStock(item.getBienThe(), item.getSoLuong()));

        BigDecimal tongTienHang = cartItems.stream()
                .map(item -> item.getDonGia().multiply(BigDecimal.valueOf(item.getSoLuong())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        Voucher voucher = null;
        BigDecimal tienGiam = BigDecimal.ZERO;
        if (request.getMaVoucher() != null) {
            voucher = validateVoucherForOrder(request.getMaVoucher(), tongTienHang);
            tienGiam = calculateVoucherDiscount(voucher, tongTienHang);
        }
        BigDecimal phiVanChuyen = request.getPhiVanChuyen() != null ? request.getPhiVanChuyen() : BigDecimal.ZERO;
        BigDecimal tongThanhToan = tongTienHang.subtract(tienGiam).add(phiVanChuyen);

        DonHang donHang = new DonHang();
        donHang.setNguoiDung(nguoiDung);
        donHang.setMaVoucher(request.getMaVoucher());
        donHang.setHoTenNguoiNhan(request.getHoTenNguoiNhan().trim());
        donHang.setSoDienThoaiNguoiNhan(request.getSoDienThoaiNguoiNhan().trim());
        donHang.setDiaChiGiaoHang(request.getDiaChiGiaoHang().trim());
        donHang.setQuanHuyen(request.getQuanHuyen());
        donHang.setTinhThanhGiaoHang(request.getTinhThanhGiaoHang().trim());
        donHang.setGhiChuGiaoHang(request.getGhiChuGiaoHang());
        donHang.setTrangThaiDonHang(STATUS_CHO_XAC_NHAN);
        donHang.setTongTienHang(tongTienHang);
        donHang.setTienGiam(tienGiam);
        donHang.setPhiVanChuyen(phiVanChuyen);
        donHang.setTongThanhToan(tongThanhToan);
        donHang.setPhuongThucThanhToan(normalizePaymentMethod(request.getPhuongThucThanhToan()));
        donHang.setTrangThaiThanhToan(PAYMENT_STATUS_CHO_THANH_TOAN);
        donHang.setNgayThanhToan(null);
        donHang.setTrangThaiHoanHang("khongCo");
        donHang.setNgayDatHang(LocalDateTime.now());
        donHang.setGhiChu(request.getGhiChu());

        DonHang savedOrder = donHangRepository.save(donHang);

        for (GioHang item : cartItems) {
            BienThe bienThe = item.getBienThe();
            bienThe.setSoLuongTon(bienThe.getSoLuongTon() - item.getSoLuong());
            bienTheRepository.save(bienThe);

            ChiTietDonHang chiTiet = new ChiTietDonHang();
            chiTiet.setDonHang(savedOrder);
            chiTiet.setBienThe(bienThe);
            chiTiet.setSoLuong(item.getSoLuong());
            chiTiet.setDonGia(item.getDonGia());
            chiTiet.setThanhTien(item.getDonGia().multiply(BigDecimal.valueOf(item.getSoLuong())));
            chiTiet.setSoLuongHoan(0);
            chiTiet.setDaKiemDuyetDanhGia(false);
            chiTietDonHangRepository.save(chiTiet);
        }

        gioHangRepository.deleteByNguoiDung_MaNguoiDung(request.getMaNguoiDung());

        if (voucher != null) {
            voucher.setSoLuongTon(Math.max(voucher.getSoLuongTon() - 1, 0));
            voucherRepository.save(voucher);
        }

        return getOrderById(savedOrder.getMaDonHang());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUser(Integer maNguoiDung, String status) {
        getUser(maNguoiDung);
        return donHangRepository.findByNguoiDung_MaNguoiDungOrderByNgayDatHangDesc(maNguoiDung)
                .stream()
                .filter(order -> matchesStatus(order, status))
                .map(this::toOrderResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDetailResponse getOrderById(Integer maDonHang) {
        DonHang donHang = getOrder(maDonHang);
        return toDetailResponse(donHang);
    }

    @Override
    @Transactional
    public OrderDetailResponse cancelOrder(Integer maDonHang, CancelOrderRequest request) {
        DonHang donHang = getOrder(maDonHang);
        if (!STATUS_CHO_XAC_NHAN.equals(donHang.getTrangThaiDonHang())) {
            throw new BadRequestException("Chỉ có thể hủy đơn hàng đang chờ xác nhận");
        }

        donHang.setTrangThaiDonHang(STATUS_DA_HUY);
        donHang.setLyDoHuy(request != null ? request.getLyDoHuy() : null);
        restoreStock(donHang);
        return toDetailResponse(donHangRepository.save(donHang));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders(String status, String keyword) {
        return donHangRepository.findAllByOrderByNgayDatHangDesc()
                .stream()
                .filter(order -> matchesStatus(order, status))
                .filter(order -> matchesKeyword(order, keyword))
                .map(this::toOrderResponse)
                .toList();
    }

    @Override
    @Transactional
    public OrderDetailResponse updateOrderStatus(Integer maDonHang, String status) {
        if (status == null || status.isBlank()) {
            throw new BadRequestException("Trạng thái đơn hàng không được rỗng");
        }
        if (!VALID_ORDER_STATUSES.contains(status)) {
            throw new BadRequestException("Trạng thái đơn hàng không hợp lệ: " + status);
        }

        DonHang donHang = getOrder(maDonHang);
        validateOrderStatusTransition(donHang, status);
        donHang.setTrangThaiDonHang(status);

        return toDetailResponse(donHangRepository.save(donHang));
    }

    @Override
    @Transactional
    public OrderDetailResponse confirmReceived(Integer maDonHang, ConfirmReceivedRequest request) {
        DonHang donHang = getOrder(maDonHang);
        ensureOrderBelongsToUser(donHang, request != null ? request.getMaNguoiDung() : null);
        if (!STATUS_DANG_GIAO.equals(donHang.getTrangThaiDonHang())) {
            throw new BadRequestException("Chỉ có thể xác nhận đã nhận hàng khi đơn đang giao.");
        }

        donHang.setTrangThaiDonHang(STATUS_KHACH_DA_NHAN);
        if (PAYMENT_COD.equals(donHang.getPhuongThucThanhToan())) {
            donHang.setTrangThaiThanhToan(PAYMENT_STATUS_THANH_CONG);
            donHang.setNgayThanhToan(LocalDateTime.now());
        }

        return toDetailResponse(donHangRepository.save(donHang));
    }

    @Override
    @Transactional
    public OrderDetailResponse confirmBankTransfer(Integer maDonHang, ConfirmBankTransferRequest request) {
        DonHang donHang = getOrder(maDonHang);
        if (!PAYMENT_CHUYEN_KHOAN.equals(donHang.getPhuongThucThanhToan())) {
            throw new BadRequestException("Chỉ áp dụng xác nhận chuyển khoản cho đơn hàng thanh toán chuyển khoản.");
        }
        if (request == null || request.getMaNhanVienXuLy() == null) {
            throw new BadRequestException("Mã nhân viên xử lý không được rỗng.");
        }
        getUser(request.getMaNhanVienXuLy());

        donHang.setTrangThaiThanhToan(PAYMENT_STATUS_THANH_CONG);
        donHang.setNgayThanhToan(LocalDateTime.now());
        donHang.setMaGiaoDich(trimToNull(request.getMaGiaoDich()));
        donHang.setMaNhanVienXuLy(request.getMaNhanVienXuLy());
        donHang.setGhiChuXuLy(trimToNull(request.getGhiChuXuLy()));

        return toDetailResponse(donHangRepository.save(donHang));
    }

    @Override
    @Transactional
    public OrderDetailResponse confirmWalletPayment(Integer maDonHang, ConfirmWalletPaymentRequest request) {
        DonHang donHang = getOrder(maDonHang);
        if (!PAYMENT_VI.equals(donHang.getPhuongThucThanhToan())) {
            throw new BadRequestException("Chỉ áp dụng xác nhận thanh toán ví cho đơn hàng thanh toán ví.");
        }
        ensureOrderBelongsToUser(donHang, request != null ? request.getMaNguoiDung() : null);

        donHang.setTrangThaiThanhToan(PAYMENT_STATUS_THANH_CONG);
        donHang.setNgayThanhToan(LocalDateTime.now());
        donHang.setMaGiaoDich(trimToNull(request.getMaGiaoDich()));

        return toDetailResponse(donHangRepository.save(donHang));
    }

    private OrderResponse toOrderResponse(DonHang donHang) {
        return new OrderResponse(
                donHang.getMaDonHang(),
                donHang.getNguoiDung().getMaNguoiDung(),
                donHang.getHoTenNguoiNhan(),
                donHang.getSoDienThoaiNguoiNhan(),
                donHang.getNgayDatHang(),
                donHang.getTrangThaiDonHang(),
                donHang.getTongThanhToan(),
                donHang.getPhuongThucThanhToan(),
                donHang.getTrangThaiThanhToan(),
                getOrderItems(donHang).stream()
                        .map(ChiTietDonHang::getSoLuong)
                        .reduce(0, Integer::sum)
        );
    }

    private OrderDetailResponse toDetailResponse(DonHang donHang) {
        List<OrderItemResponse> items = getOrderItems(donHang)
                .stream()
                .map(this::toItemResponse)
                .toList();

        return new OrderDetailResponse(
                donHang.getMaDonHang(),
                donHang.getNguoiDung().getMaNguoiDung(),
                donHang.getMaVoucher(),
                donHang.getMaCombo(),
                donHang.getHoTenNguoiNhan(),
                donHang.getSoDienThoaiNguoiNhan(),
                donHang.getDiaChiGiaoHang(),
                donHang.getQuanHuyen(),
                donHang.getTinhThanhGiaoHang(),
                donHang.getGhiChuGiaoHang(),
                donHang.getTrangThaiDonHang(),
                donHang.getTongTienHang(),
                donHang.getTienGiam(),
                donHang.getPhiVanChuyen(),
                donHang.getTongThanhToan(),
                donHang.getPhuongThucThanhToan(),
                donHang.getTrangThaiThanhToan(),
                donHang.getMaGiaoDich(),
                donHang.getNgayThanhToan(),
                donHang.getLyDoHuy(),
                donHang.getLyDoHoanHang(),
                donHang.getHinhAnhMinhChung(),
                donHang.getTrangThaiHoanHang(),
                donHang.getMaNhanVienXuLy(),
                donHang.getGhiChuXuLy(),
                donHang.getNgayDatHang(),
                donHang.getGhiChu(),
                items
        );
    }

    private OrderItemResponse toItemResponse(ChiTietDonHang item) {
        BienThe bienThe = item.getBienThe();
        SanPham sanPham = bienThe.getSanPham();
        String hinhAnh = bienThe.getHinhAnh() != null ? bienThe.getHinhAnh() : sanPham.getHinhAnh();

        return new OrderItemResponse(
                item.getMaChiTietDonHang(),
                bienThe.getMaBienThe(),
                sanPham.getMaSanPham(),
                sanPham.getTenSanPham(),
                bienThe.getTrongLuong(),
                bienThe.getQuyCachDongGoi(),
                hinhAnh,
                item.getSoLuong(),
                item.getDonGia(),
                item.getThanhTien(),
                item.getSoSao(),
                item.getNoiDungDanhGia(),
                item.getDaKiemDuyetDanhGia()
        );
    }

    private NguoiDung getUser(Integer maNguoiDung) {
        return nguoiDungRepository.findById(maNguoiDung)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với mã: " + maNguoiDung));
    }

    private DonHang getOrder(Integer maDonHang) {
        return donHangRepository.findByMaDonHang(maDonHang)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với mã: " + maDonHang));
    }

    private void validateStock(BienThe bienThe, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new BadRequestException("Số lượng sản phẩm không hợp lệ");
        }
        if (bienThe.getSoLuongTon() == null || bienThe.getSoLuongTon() < quantity) {
            throw new BadRequestException("Tồn kho không đủ cho biến thể: " + bienThe.getMaBienThe());
        }
    }

    private Voucher validateVoucherForOrder(Integer maVoucher, BigDecimal tongTienHang) {
        Voucher voucher = voucherRepository.findById(maVoucher)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay voucher voi ma: " + maVoucher));

        if (!Boolean.TRUE.equals(voucher.getTrangThai())) {
            throw new BadRequestException("Voucher da bi tat");
        }

        if (voucher.getSoLuongTon() == null || voucher.getSoLuongTon() <= 0) {
            throw new BadRequestException("Voucher da het luot su dung");
        }

        if (voucher.getNgayHetHan() == null || voucher.getNgayHetHan().isBefore(LocalDate.now())) {
            throw new BadRequestException("Voucher da het han");
        }

        if (voucher.getNgayBatDau() != null && voucher.getNgayBatDau().isAfter(LocalDate.now())) {
            throw new BadRequestException("Voucher chua den ngay ap dung");
        }

        BigDecimal minimum = voucher.getDonHangToiThieu() != null ? voucher.getDonHangToiThieu() : BigDecimal.ZERO;
        if (tongTienHang.compareTo(minimum) < 0) {
            throw new BadRequestException("Don hang chua dat gia tri toi thieu de ap dung voucher");
        }

        return voucher;
    }

    private BigDecimal calculateVoucherDiscount(Voucher voucher, BigDecimal tongTienHang) {
        BigDecimal discount;

        if (VOUCHER_TYPE_PERCENT.equals(voucher.getLoaiGiam())) {
            discount = tongTienHang.multiply(voucher.getGiaTriGiam())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else if (VOUCHER_TYPE_AMOUNT.equals(voucher.getLoaiGiam())) {
            discount = voucher.getGiaTriGiam();
        } else {
            throw new BadRequestException("Loai giam voucher khong hop le: " + voucher.getLoaiGiam());
        }

        return discount.compareTo(tongTienHang) > 0 ? tongTienHang : discount;
    }

    private void restoreStock(DonHang donHang) {
        donHang.getChiTietDonHangs().forEach(item -> {
            BienThe bienThe = item.getBienThe();
            bienThe.setSoLuongTon(bienThe.getSoLuongTon() + item.getSoLuong());
            bienTheRepository.save(bienThe);
        });
    }

    private void validateOrderStatusTransition(DonHang donHang, String targetStatus) {
        String currentStatus = donHang.getTrangThaiDonHang();
        if (STATUS_DA_HUY.equals(currentStatus)) {
            throw new BadRequestException("Không thể cập nhật trạng thái đơn hàng đã hủy.");
        }

        if (STATUS_CHO_XAC_NHAN.equals(currentStatus) && STATUS_DA_XAC_NHAN.equals(targetStatus)) {
            ensureCanConfirmOrder(donHang);
            return;
        }

        if (STATUS_DA_XAC_NHAN.equals(currentStatus) && STATUS_DANG_GIAO.equals(targetStatus)) {
            return;
        }

        if (STATUS_DANG_GIAO.equals(currentStatus) && STATUS_DA_GIAO.equals(targetStatus)) {
            throw new BadRequestException("Khách hàng chưa xác nhận đã nhận hàng.");
        }

        if (STATUS_KHACH_DA_NHAN.equals(currentStatus) && STATUS_DA_GIAO.equals(targetStatus)) {
            return;
        }

        throw new BadRequestException("Không thể chuyển trạng thái đơn hàng từ " + currentStatus + " sang " + targetStatus + ".");
    }

    private void ensureCanConfirmOrder(DonHang donHang) {
        if (PAYMENT_COD.equals(donHang.getPhuongThucThanhToan())) {
            return;
        }

        if (PREPAID_PAYMENT_METHODS.contains(donHang.getPhuongThucThanhToan())
                && PAYMENT_STATUS_THANH_CONG.equals(donHang.getTrangThaiThanhToan())) {
            return;
        }

        throw new BadRequestException("Đơn hàng chưa thanh toán, không thể xác nhận.");
    }

    private void ensureOrderBelongsToUser(DonHang donHang, Integer maNguoiDung) {
        if (maNguoiDung == null) {
            throw new BadRequestException("Mã người dùng không được rỗng.");
        }
        getUser(maNguoiDung);
        if (!donHang.getNguoiDung().getMaNguoiDung().equals(maNguoiDung)) {
            throw new BadRequestException("Đơn hàng không thuộc người dùng này.");
        }
    }

    private String normalizePaymentMethod(String paymentMethod) {
        if (paymentMethod == null || paymentMethod.isBlank()) {
            throw new BadRequestException("Phương thức thanh toán không được rỗng.");
        }

        String value = paymentMethod.trim();
        if (PAYMENT_COD.equalsIgnoreCase(value)) {
            return PAYMENT_COD;
        }
        if (PAYMENT_CHUYEN_KHOAN.equals(value) || PAYMENT_VI.equals(value)) {
            return value;
        }

        throw new BadRequestException("Phương thức thanh toán không hợp lệ: " + paymentMethod);
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private List<ChiTietDonHang> getOrderItems(DonHang donHang) {
        if (donHang.getMaDonHang() == null) {
            return donHang.getChiTietDonHangs();
        }
        return chiTietDonHangRepository.findByDonHang_MaDonHang(donHang.getMaDonHang());
    }

    private boolean matchesStatus(DonHang donHang, String status) {
        return status == null || status.isBlank() || status.equals(donHang.getTrangThaiDonHang());
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
