package com.example.dacsanmientrung_backend.service.impl;

import com.example.dacsanmientrung_backend.dto.request.ImportStockRequest;
import com.example.dacsanmientrung_backend.dto.request.UpdateStockRequest;
import com.example.dacsanmientrung_backend.dto.response.InventoryResponse;
import com.example.dacsanmientrung_backend.dto.response.InventorySummaryResponse;
import com.example.dacsanmientrung_backend.entity.BienThe;
import com.example.dacsanmientrung_backend.entity.DanhMuc;
import com.example.dacsanmientrung_backend.entity.SanPham;
import com.example.dacsanmientrung_backend.exception.BadRequestException;
import com.example.dacsanmientrung_backend.exception.ResourceNotFoundException;
import com.example.dacsanmientrung_backend.repository.BienTheRepository;
import com.example.dacsanmientrung_backend.service.InventoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class InventoryServiceImpl implements InventoryService {

    private static final String HET_HANG = "hetHang";
    private static final String RAT_THAP = "ratThap";
    private static final String CAN_NHAP_THEM = "canNhapThem";
    private static final String CON_HANG = "conHang";

    private final BienTheRepository bienTheRepository;

    public InventoryServiceImpl(BienTheRepository bienTheRepository) {
        this.bienTheRepository = bienTheRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryResponse> getInventory(String keyword, Integer categoryId, String province, String status) {
        validateInventoryStatusFilter(status);
        String normalizedKeyword = normalize(keyword);
        String normalizedProvince = normalize(province);

        return bienTheRepository.findAll().stream()
                .filter(bienThe -> matchesKeyword(bienThe, normalizedKeyword))
                .filter(bienThe -> matchesCategory(bienThe, categoryId))
                .filter(bienThe -> matchesProvince(bienThe, normalizedProvince))
                .filter(bienThe -> matchesStatus(bienThe, status))
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public InventorySummaryResponse getSummary() {
        List<BienThe> bienThes = bienTheRepository.findAll();
        long tongTonKho = bienThes.stream()
                .mapToLong(bienThe -> safeStock(bienThe).longValue())
                .sum();
        long hetHang = countByInventoryStatus(bienThes, HET_HANG);
        long ratThap = countByInventoryStatus(bienThes, RAT_THAP);
        long canNhapThem = countByInventoryStatus(bienThes, CAN_NHAP_THEM);
        long conHang = countByInventoryStatus(bienThes, CON_HANG);

        return new InventorySummaryResponse(
                bienThes.size(),
                tongTonKho,
                hetHang,
                ratThap,
                canNhapThem,
                conHang
        );
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryResponse getInventoryByVariantId(Integer maBienThe) {
        BienThe bienThe = findBienThe(maBienThe);
        return toResponse(bienThe);
    }

    @Override
    @Transactional
    public InventoryResponse updateStock(Integer maBienThe, UpdateStockRequest request) {
        if (request == null || request.getSoLuongTonMoi() == null) {
            throw new BadRequestException("Số lượng tồn mới không được rỗng");
        }

        if (request.getSoLuongTonMoi() < 0) {
            throw new BadRequestException("Số lượng tồn mới phải lớn hơn hoặc bằng 0");
        }

        BienThe bienThe = findBienThe(maBienThe);
        bienThe.setSoLuongTon(request.getSoLuongTonMoi());
        return toResponse(bienTheRepository.save(bienThe));
    }

    @Override
    @Transactional
    public InventoryResponse importStock(Integer maBienThe, ImportStockRequest request) {
        if (request == null || request.getSoLuongNhapThem() == null) {
            throw new BadRequestException("Số lượng nhập thêm không được rỗng");
        }

        if (request.getSoLuongNhapThem() <= 0) {
            throw new BadRequestException("Số lượng nhập thêm phải lớn hơn 0");
        }

        BienThe bienThe = findBienThe(maBienThe);
        bienThe.setSoLuongTon(safeStock(bienThe) + request.getSoLuongNhapThem());
        return toResponse(bienTheRepository.save(bienThe));
    }

    private BienThe findBienThe(Integer maBienThe) {
        return bienTheRepository.findById(maBienThe)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy biến thể với mã: " + maBienThe));
    }

    private boolean matchesKeyword(BienThe bienThe, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }

        SanPham sanPham = bienThe.getSanPham();
        return contains(sanPham != null ? sanPham.getTenSanPham() : null, keyword)
                || contains(bienThe.getTrongLuong(), keyword)
                || contains(bienThe.getQuyCachDongGoi(), keyword);
    }

    private boolean matchesCategory(BienThe bienThe, Integer categoryId) {
        if (categoryId == null) {
            return true;
        }

        SanPham sanPham = bienThe.getSanPham();
        DanhMuc danhMuc = sanPham != null ? sanPham.getDanhMuc() : null;
        return danhMuc != null && categoryId.equals(danhMuc.getMaDanhMuc());
    }

    private boolean matchesProvince(BienThe bienThe, String province) {
        if (province == null || province.isBlank()) {
            return true;
        }

        SanPham sanPham = bienThe.getSanPham();
        return contains(sanPham != null ? sanPham.getTenTinh() : null, province);
    }

    private boolean matchesStatus(BienThe bienThe, String status) {
        return status == null || status.isBlank() || status.equals(getInventoryStatus(safeStock(bienThe)));
    }

    private void validateInventoryStatusFilter(String status) {
        if (status == null || status.isBlank()) {
            return;
        }

        if (!List.of(HET_HANG, RAT_THAP, CAN_NHAP_THEM, CON_HANG).contains(status)) {
            throw new BadRequestException("Trạng thái tồn kho không hợp lệ: " + status);
        }
    }

    private long countByInventoryStatus(List<BienThe> bienThes, String status) {
        return bienThes.stream()
                .filter(bienThe -> status.equals(getInventoryStatus(safeStock(bienThe))))
                .count();
    }

    private InventoryResponse toResponse(BienThe bienThe) {
        SanPham sanPham = bienThe.getSanPham();
        DanhMuc danhMuc = sanPham != null ? sanPham.getDanhMuc() : null;
        Integer stock = safeStock(bienThe);
        String inventoryStatus = getInventoryStatus(stock);

        return new InventoryResponse(
                bienThe.getMaBienThe(),
                sanPham != null ? sanPham.getMaSanPham() : null,
                sanPham != null ? sanPham.getTenSanPham() : null,
                danhMuc != null ? danhMuc.getMaDanhMuc() : null,
                danhMuc != null ? danhMuc.getTenDanhMuc() : null,
                sanPham != null ? sanPham.getTenTinh() : null,
                sanPham != null ? sanPham.getVungMien() : null,
                sanPham != null ? sanPham.getHinhAnh() : null,
                bienThe.getHinhAnh(),
                bienThe.getTrongLuong(),
                bienThe.getQuyCachDongGoi(),
                bienThe.getGiaBan(),
                stock,
                bienThe.getHanSuDung(),
                bienThe.getTrangThai(),
                inventoryStatus,
                getInventoryStatusLabel(inventoryStatus)
        );
    }

    private String getInventoryStatus(Integer stock) {
        if (stock == 0) {
            return HET_HANG;
        }

        if (stock <= 10) {
            return RAT_THAP;
        }

        if (stock <= 20) {
            return CAN_NHAP_THEM;
        }

        return CON_HANG;
    }

    private String getInventoryStatusLabel(String status) {
        return switch (status) {
            case HET_HANG -> "Hết hàng";
            case RAT_THAP -> "Rất thấp";
            case CAN_NHAP_THEM -> "Cần nhập thêm";
            case CON_HANG -> "Còn hàng";
            default -> status;
        };
    }

    private Integer safeStock(BienThe bienThe) {
        return bienThe.getSoLuongTon() == null ? 0 : bienThe.getSoLuongTon();
    }

    private boolean contains(String value, String keyword) {
        return value != null && normalize(value).contains(keyword);
    }

    private String normalize(String value) {
        return value == null ? null : value.trim().toLowerCase(Locale.ROOT);
    }
}
