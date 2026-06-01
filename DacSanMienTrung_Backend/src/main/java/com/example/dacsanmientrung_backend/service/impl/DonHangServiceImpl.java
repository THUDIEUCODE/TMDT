package com.example.dacsanmientrung_backend.service.impl;

import com.example.dacsanmientrung_backend.dto.request.CancelOrderRequest;
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
import com.example.dacsanmientrung_backend.exception.BadRequestException;
import com.example.dacsanmientrung_backend.exception.ResourceNotFoundException;
import com.example.dacsanmientrung_backend.repository.BienTheRepository;
import com.example.dacsanmientrung_backend.repository.ChiTietDonHangRepository;
import com.example.dacsanmientrung_backend.repository.DonHangRepository;
import com.example.dacsanmientrung_backend.repository.GioHangRepository;
import com.example.dacsanmientrung_backend.repository.NguoiDungRepository;
import com.example.dacsanmientrung_backend.service.DonHangService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class DonHangServiceImpl implements DonHangService {

    private static final String STATUS_CHO_XAC_NHAN = "choXacNhan";
    private static final String STATUS_DA_GIAO = "daGiao";
    private static final String STATUS_DA_HUY = "daHuy";
    private static final String PAYMENT_COD = "COD";
    private static final Set<String> VALID_ORDER_STATUSES = Set.of(
            "choXacNhan", "daXacNhan", "dangGiao", "daGiao", "daHuy", "dangHoanHang"
    );

    private final DonHangRepository donHangRepository;
    private final ChiTietDonHangRepository chiTietDonHangRepository;
    private final GioHangRepository gioHangRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final BienTheRepository bienTheRepository;

    public DonHangServiceImpl(
            DonHangRepository donHangRepository,
            ChiTietDonHangRepository chiTietDonHangRepository,
            GioHangRepository gioHangRepository,
            NguoiDungRepository nguoiDungRepository,
            BienTheRepository bienTheRepository
    ) {
        this.donHangRepository = donHangRepository;
        this.chiTietDonHangRepository = chiTietDonHangRepository;
        this.gioHangRepository = gioHangRepository;
        this.nguoiDungRepository = nguoiDungRepository;
        this.bienTheRepository = bienTheRepository;
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
        BigDecimal tienGiam = BigDecimal.ZERO;
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
        donHang.setPhuongThucThanhToan(request.getPhuongThucThanhToan().trim());
        donHang.setTrangThaiThanhToan("choThanhToan");
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
        donHang.setTrangThaiDonHang(status);

        if (STATUS_DA_GIAO.equals(status) && PAYMENT_COD.equalsIgnoreCase(donHang.getPhuongThucThanhToan())) {
            donHang.setTrangThaiThanhToan("thanhCong");
            donHang.setNgayThanhToan(LocalDateTime.now());
        }

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

    private void restoreStock(DonHang donHang) {
        donHang.getChiTietDonHangs().forEach(item -> {
            BienThe bienThe = item.getBienThe();
            bienThe.setSoLuongTon(bienThe.getSoLuongTon() + item.getSoLuong());
            bienTheRepository.save(bienThe);
        });
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
