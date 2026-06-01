package com.example.dacsanmientrung_backend.service.impl;

import com.example.dacsanmientrung_backend.dto.response.AdminDashboardResponse;
import com.example.dacsanmientrung_backend.dto.response.LowStockResponse;
import com.example.dacsanmientrung_backend.dto.response.OrderStatusStatResponse;
import com.example.dacsanmientrung_backend.dto.response.RecentOrderResponse;
import com.example.dacsanmientrung_backend.dto.response.RevenueByDayResponse;
import com.example.dacsanmientrung_backend.dto.response.StaffDashboardResponse;
import com.example.dacsanmientrung_backend.dto.response.TopProductResponse;
import com.example.dacsanmientrung_backend.entity.BienThe;
import com.example.dacsanmientrung_backend.entity.ChiTietDonHang;
import com.example.dacsanmientrung_backend.entity.DonHang;
import com.example.dacsanmientrung_backend.entity.SanPham;
import com.example.dacsanmientrung_backend.entity.Voucher;
import com.example.dacsanmientrung_backend.repository.BienTheRepository;
import com.example.dacsanmientrung_backend.repository.ChiTietDonHangRepository;
import com.example.dacsanmientrung_backend.repository.DonHangRepository;
import com.example.dacsanmientrung_backend.repository.NguoiDungRepository;
import com.example.dacsanmientrung_backend.repository.SanPhamRepository;
import com.example.dacsanmientrung_backend.repository.VoucherRepository;
import com.example.dacsanmientrung_backend.service.DashboardService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private static final List<String> ORDER_STATUSES = List.of(
            "choXacNhan", "daXacNhan", "dangGiao", "daGiao", "daHuy", "dangHoanHang"
    );

    private final DonHangRepository donHangRepository;
    private final ChiTietDonHangRepository chiTietDonHangRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final SanPhamRepository sanPhamRepository;
    private final BienTheRepository bienTheRepository;
    private final VoucherRepository voucherRepository;

    public DashboardServiceImpl(
            DonHangRepository donHangRepository,
            ChiTietDonHangRepository chiTietDonHangRepository,
            NguoiDungRepository nguoiDungRepository,
            SanPhamRepository sanPhamRepository,
            BienTheRepository bienTheRepository,
            VoucherRepository voucherRepository
    ) {
        this.donHangRepository = donHangRepository;
        this.chiTietDonHangRepository = chiTietDonHangRepository;
        this.nguoiDungRepository = nguoiDungRepository;
        this.sanPhamRepository = sanPhamRepository;
        this.bienTheRepository = bienTheRepository;
        this.voucherRepository = voucherRepository;
    }

    @Override
    public StaffDashboardResponse getStaffDashboard() {
        List<DonHang> orders = donHangRepository.findAllByOrderByNgayDatHangDesc();
        LocalDate today = LocalDate.now();

        return new StaffDashboardResponse(
                orders.stream().filter(order -> isSameOrderDate(order, today)).count(),
                donHangRepository.countByTrangThaiDonHang("choXacNhan"),
                donHangRepository.countByTrangThaiDonHang("dangGiao"),
                calculateRevenueForDate(orders, today),
                bienTheRepository.countBySoLuongTonLessThanEqual(20),
                orders.stream().filter(order -> "choDuyet".equals(order.getTrangThaiHoanHang())).count(),
                chiTietDonHangRepository.findBySoSaoIsNotNullAndDaKiemDuyetDanhGiaFalseOrderByNgayDanhGiaDesc().size() * 1L,
                getRecentOrders(),
                getLowStockWarnings()
        );
    }

    @Override
    public AdminDashboardResponse getAdminDashboard() {
        List<DonHang> orders = donHangRepository.findAllByOrderByNgayDatHangDesc();
        YearMonth currentMonth = YearMonth.now();

        return new AdminDashboardResponse(
                calculateTotalRevenue(orders),
                donHangRepository.count(),
                nguoiDungRepository.countByVaiTro("khachhang"),
                sanPhamRepository.count(),
                donHangRepository.countByTrangThaiDonHang("choXacNhan"),
                countActiveVouchers(),
                calculateRevenueForMonth(orders, currentMonth),
                nguoiDungRepository.countByTrangThaiFalse(),
                getRevenueLastSevenDays(orders),
                getOrderStatusStats(),
                getTopProducts(),
                getRecentOrders(),
                getLowStockWarnings()
        );
    }

    private List<RecentOrderResponse> getRecentOrders() {
        return donHangRepository.findTop5ByOrderByNgayDatHangDesc()
                .stream()
                .map(this::toRecentOrder)
                .toList();
    }

    private List<LowStockResponse> getLowStockWarnings() {
        return bienTheRepository.findTop5ByOrderBySoLuongTonAsc()
                .stream()
                .map(this::toLowStockResponse)
                .toList();
    }

    private List<RevenueByDayResponse> getRevenueLastSevenDays(List<DonHang> orders) {
        LocalDate today = LocalDate.now();
        return today.minusDays(6)
                .datesUntil(today.plusDays(1))
                .map(date -> new RevenueByDayResponse(date, calculateRevenueForDate(orders, date)))
                .toList();
    }

    private List<OrderStatusStatResponse> getOrderStatusStats() {
        return ORDER_STATUSES.stream()
                .map(status -> new OrderStatusStatResponse(status, getStatusLabel(status), donHangRepository.countByTrangThaiDonHang(status)))
                .toList();
    }

    private List<TopProductResponse> getTopProducts() {
        Map<Integer, ProductStat> stats = new HashMap<>();

        chiTietDonHangRepository.findAllByOrderByMaChiTietDonHangAsc().forEach(item -> {
            SanPham product = item.getBienThe().getSanPham();
            ProductStat stat = stats.computeIfAbsent(product.getMaSanPham(), id -> new ProductStat(product));
            stat.quantity += item.getSoLuong();
            stat.revenue = stat.revenue.add(item.getThanhTien());
        });

        return stats.values()
                .stream()
                .sorted(Comparator.comparing(ProductStat::getQuantity).reversed())
                .limit(5)
                .map(stat -> new TopProductResponse(
                        stat.product.getMaSanPham(),
                        stat.product.getTenSanPham(),
                        stat.product.getDanhMuc().getTenDanhMuc(),
                        stat.quantity,
                        stat.revenue
                ))
                .toList();
    }

    private BigDecimal calculateTotalRevenue(List<DonHang> orders) {
        return orders.stream()
                .filter(this::isRevenueOrder)
                .map(DonHang::getTongThanhToan)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateRevenueForDate(List<DonHang> orders, LocalDate date) {
        return orders.stream()
                .filter(this::isRevenueOrder)
                .filter(order -> isSameOrderDate(order, date))
                .map(DonHang::getTongThanhToan)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateRevenueForMonth(List<DonHang> orders, YearMonth month) {
        return orders.stream()
                .filter(this::isRevenueOrder)
                .filter(order -> order.getNgayDatHang() != null && YearMonth.from(order.getNgayDatHang()).equals(month))
                .map(DonHang::getTongThanhToan)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private long countActiveVouchers() {
        LocalDate today = LocalDate.now();
        return voucherRepository.findByTrangThaiTrueOrderByNgayHetHanAsc()
                .stream()
                .filter(voucher -> isActiveVoucher(voucher, today))
                .count();
    }

    private boolean isActiveVoucher(Voucher voucher, LocalDate today) {
        return Boolean.TRUE.equals(voucher.getTrangThai())
                && voucher.getSoLuongTon() != null
                && voucher.getSoLuongTon() > 0
                && !voucher.getNgayHetHan().isBefore(today)
                && (voucher.getNgayBatDau() == null || !voucher.getNgayBatDau().isAfter(today));
    }

    private boolean isRevenueOrder(DonHang order) {
        return "thanhCong".equals(order.getTrangThaiThanhToan()) || "daGiao".equals(order.getTrangThaiDonHang());
    }

    private boolean isSameOrderDate(DonHang order, LocalDate date) {
        return order.getNgayDatHang() != null && order.getNgayDatHang().toLocalDate().equals(date);
    }

    private RecentOrderResponse toRecentOrder(DonHang order) {
        return new RecentOrderResponse(
                order.getMaDonHang(),
                order.getHoTenNguoiNhan(),
                order.getSoDienThoaiNguoiNhan(),
                order.getNgayDatHang(),
                order.getTongThanhToan(),
                order.getTrangThaiDonHang(),
                order.getPhuongThucThanhToan()
        );
    }

    private LowStockResponse toLowStockResponse(BienThe variant) {
        SanPham product = variant.getSanPham();
        return new LowStockResponse(
                variant.getMaBienThe(),
                product.getMaSanPham(),
                product.getTenSanPham(),
                variant.getTrongLuong(),
                variant.getQuyCachDongGoi(),
                variant.getSoLuongTon(),
                20,
                getStockWarningStatus(variant.getSoLuongTon())
        );
    }

    private String getStockWarningStatus(Integer stock) {
        int quantity = stock != null ? stock : 0;
        if (quantity == 0) {
            return "hetHang";
        }
        if (quantity <= 10) {
            return "ratThap";
        }
        if (quantity <= 20) {
            return "canNhapThem";
        }
        return "onDinh";
    }

    private String getStatusLabel(String status) {
        return switch (status) {
            case "choXacNhan" -> "Chờ xác nhận";
            case "daXacNhan" -> "Đã xác nhận";
            case "dangGiao" -> "Đang giao";
            case "daGiao" -> "Đã giao";
            case "daHuy" -> "Đã hủy";
            case "dangHoanHang" -> "Đang hoàn hàng";
            default -> status;
        };
    }

    private static class ProductStat {
        private final SanPham product;
        private Integer quantity = 0;
        private BigDecimal revenue = BigDecimal.ZERO;

        private ProductStat(SanPham product) {
            this.product = product;
        }

        private Integer getQuantity() {
            return quantity;
        }
    }
}
