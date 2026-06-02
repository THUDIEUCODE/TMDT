package com.example.dacsanmientrung_backend.service.impl;

import com.example.dacsanmientrung_backend.dto.request.SanPhamRequest;
import com.example.dacsanmientrung_backend.dto.response.BienTheResponse;
import com.example.dacsanmientrung_backend.dto.response.SanPhamDetailResponse;
import com.example.dacsanmientrung_backend.dto.response.SanPhamResponse;
import com.example.dacsanmientrung_backend.entity.BienThe;
import com.example.dacsanmientrung_backend.entity.DanhMuc;
import com.example.dacsanmientrung_backend.entity.SanPham;
import com.example.dacsanmientrung_backend.exception.BadRequestException;
import com.example.dacsanmientrung_backend.exception.ResourceNotFoundException;
import com.example.dacsanmientrung_backend.repository.BienTheRepository;
import com.example.dacsanmientrung_backend.repository.DanhMucRepository;
import com.example.dacsanmientrung_backend.repository.SanPhamRepository;
import com.example.dacsanmientrung_backend.service.SanPhamService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class SanPhamServiceImpl implements SanPhamService {

    private final SanPhamRepository sanPhamRepository;
    private final BienTheRepository bienTheRepository;
    private final DanhMucRepository danhMucRepository;

    public SanPhamServiceImpl(
            SanPhamRepository sanPhamRepository,
            BienTheRepository bienTheRepository,
            DanhMucRepository danhMucRepository
    ) {
        this.sanPhamRepository = sanPhamRepository;
        this.bienTheRepository = bienTheRepository;
        this.danhMucRepository = danhMucRepository;
    }

    @Override
    public List<SanPhamResponse> getProducts(String keyword, Integer categoryId, String province, BigDecimal minPrice, BigDecimal maxPrice) {
        return sanPhamRepository.findByTrangThaiTrue()
                .stream()
                .filter(sanPham -> matchesKeyword(sanPham, keyword))
                .filter(sanPham -> matchesCategory(sanPham, categoryId))
                .filter(sanPham -> matchesProvince(sanPham, province))
                .filter(sanPham -> matchesMinPrice(sanPham, minPrice))
                .filter(sanPham -> matchesMaxPrice(sanPham, maxPrice))
                .map(this::toResponse)
                .toList();
    }

    @Override
    public SanPhamDetailResponse getProductById(Integer id) {
        SanPham sanPham = sanPhamRepository.findByMaSanPhamAndTrangThaiTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với mã: " + id));

        List<BienTheResponse> bienThes = getActiveVariants(sanPham)
                .stream()
                .map(this::toBienTheResponse)
                .toList();

        DanhMuc danhMuc = sanPham.getDanhMuc();
        return new SanPhamDetailResponse(
                sanPham.getMaSanPham(),
                sanPham.getTenSanPham(),
                danhMuc.getMaDanhMuc(),
                danhMuc.getTenDanhMuc(),
                sanPham.getMoTa(),
                sanPham.getThanhPhan(),
                sanPham.getHuongDanBaoQuan(),
                sanPham.getDacTrungVanHoa(),
                sanPham.getLichSuSanPham(),
                sanPham.getTenTinh(),
                sanPham.getVungMien(),
                sanPham.getMoTaVanHoaTinh(),
                sanPham.getGiaNiemYet(),
                sanPham.getHinhAnh(),
                sanPham.getTrangThai(),
                bienThes
        );
    }

    @Override
    public List<SanPhamResponse> getProductsByCategory(Integer categoryId) {
        return sanPhamRepository.findByDanhMuc_MaDanhMucAndTrangThaiTrue(categoryId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<SanPhamResponse> getProductsByCategoryTree(Integer categoryId) {
        danhMucRepository.findByMaDanhMucAndTrangThaiTrue(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay danh muc voi ma: " + categoryId));

        List<Integer> categoryIds = new java.util.ArrayList<>();
        categoryIds.add(categoryId);
        danhMucRepository.findByDanhMucCha_MaDanhMucAndTrangThaiTrueOrderByThuTuHienThiAsc(categoryId)
                .stream()
                .map(DanhMuc::getMaDanhMuc)
                .forEach(categoryIds::add);

        return sanPhamRepository.findByDanhMuc_MaDanhMucInAndTrangThaiTrue(categoryIds)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public SanPhamDetailResponse createProduct(SanPhamRequest request) {
        validateProductRequest(request);

        SanPham sanPham = new SanPham();
        applyProductRequest(sanPham, request);
        sanPham.setTrangThai(request.getTrangThai() != null ? request.getTrangThai() : true);

        return toDetailResponse(sanPhamRepository.save(sanPham));
    }

    @Override
    @Transactional
    public SanPhamDetailResponse updateProduct(Integer id, SanPhamRequest request) {
        validateProductRequest(request);

        SanPham sanPham = sanPhamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay san pham voi ma: " + id));
        applyProductRequest(sanPham, request);
        sanPham.setTrangThai(request.getTrangThai() != null ? request.getTrangThai() : sanPham.getTrangThai());

        return toDetailResponse(sanPhamRepository.save(sanPham));
    }

    @Override
    @Transactional
    public SanPhamDetailResponse toggleProduct(Integer id) {
        SanPham sanPham = sanPhamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay san pham voi ma: " + id));
        sanPham.setTrangThai(!Boolean.TRUE.equals(sanPham.getTrangThai()));
        return toDetailResponse(sanPhamRepository.save(sanPham));
    }

    @Override
    @Transactional
    public void softDeleteProduct(Integer id) {
        SanPham sanPham = sanPhamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay san pham voi ma: " + id));
        sanPham.setTrangThai(false);
        sanPhamRepository.save(sanPham);
    }

    private void validateProductRequest(SanPhamRequest request) {
        if (request == null) {
            throw new BadRequestException("Du lieu san pham khong duoc rong");
        }

        if (request.getTenSanPham() == null || request.getTenSanPham().isBlank()) {
            throw new BadRequestException("Ten san pham khong duoc rong");
        }

        if (request.getMaDanhMuc() == null) {
            throw new BadRequestException("Ma danh muc khong duoc rong");
        }

        if (request.getGiaNiemYet() == null || request.getGiaNiemYet().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Gia niem yet phai lon hon hoac bang 0");
        }
    }

    private void applyProductRequest(SanPham sanPham, SanPhamRequest request) {
        DanhMuc danhMuc = danhMucRepository.findById(request.getMaDanhMuc())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay danh muc voi ma: " + request.getMaDanhMuc()));

        sanPham.setDanhMuc(danhMuc);
        sanPham.setTenSanPham(request.getTenSanPham().trim());
        sanPham.setMoTa(request.getMoTa());
        sanPham.setThanhPhan(request.getThanhPhan());
        sanPham.setHuongDanBaoQuan(request.getHuongDanBaoQuan());
        sanPham.setDacTrungVanHoa(request.getDacTrungVanHoa());
        sanPham.setLichSuSanPham(request.getLichSuSanPham());
        sanPham.setTenTinh(request.getTenTinh());
        sanPham.setVungMien(request.getVungMien());
        sanPham.setMoTaVanHoaTinh(request.getMoTaVanHoaTinh());
        sanPham.setGiaNiemYet(request.getGiaNiemYet());
        sanPham.setHinhAnh(request.getHinhAnh());
    }

    private SanPhamResponse toResponse(SanPham sanPham) {
        List<BienThe> activeVariants = getActiveVariants(sanPham);
        DanhMuc danhMuc = sanPham.getDanhMuc();

        return new SanPhamResponse(
                sanPham.getMaSanPham(),
                sanPham.getTenSanPham(),
                danhMuc.getTenDanhMuc(),
                danhMuc.getMaDanhMuc(),
                sanPham.getTenTinh(),
                sanPham.getVungMien(),
                sanPham.getHinhAnh(),
                sanPham.getGiaNiemYet(),
                getLowestPrice(sanPham, activeVariants),
                getTotalStock(activeVariants),
                activeVariants.size(),
                sanPham.getTrangThai()
        );
    }

    private BienTheResponse toBienTheResponse(BienThe bienThe) {
        return new BienTheResponse(
                bienThe.getMaBienThe(),
                bienThe.getSanPham().getMaSanPham(),
                bienThe.getTrongLuong(),
                bienThe.getQuyCachDongGoi(),
                bienThe.getGiaBan(),
                bienThe.getSoLuongTon(),
                bienThe.getHanSuDung(),
                bienThe.getHinhAnh(),
                bienThe.getTrangThai()
        );
    }

    private SanPhamDetailResponse toDetailResponse(SanPham sanPham) {
        List<BienTheResponse> bienThes = getActiveVariants(sanPham)
                .stream()
                .map(this::toBienTheResponse)
                .toList();

        DanhMuc danhMuc = sanPham.getDanhMuc();
        return new SanPhamDetailResponse(
                sanPham.getMaSanPham(),
                sanPham.getTenSanPham(),
                danhMuc.getMaDanhMuc(),
                danhMuc.getTenDanhMuc(),
                sanPham.getMoTa(),
                sanPham.getThanhPhan(),
                sanPham.getHuongDanBaoQuan(),
                sanPham.getDacTrungVanHoa(),
                sanPham.getLichSuSanPham(),
                sanPham.getTenTinh(),
                sanPham.getVungMien(),
                sanPham.getMoTaVanHoaTinh(),
                sanPham.getGiaNiemYet(),
                sanPham.getHinhAnh(),
                sanPham.getTrangThai(),
                bienThes
        );
    }

    private List<BienThe> getActiveVariants(SanPham sanPham) {
        return sanPham.getBienThes()
                .stream()
                .filter(bienThe -> Boolean.TRUE.equals(bienThe.getTrangThai()))
                .toList();
    }

    private BigDecimal getLowestPrice(SanPham sanPham, List<BienThe> activeVariants) {
        return activeVariants.stream()
                .map(BienThe::getGiaBan)
                .min(Comparator.naturalOrder())
                .orElse(sanPham.getGiaNiemYet());
    }

    private Integer getTotalStock(List<BienThe> activeVariants) {
        return activeVariants.stream()
                .map(BienThe::getSoLuongTon)
                .filter(stock -> stock != null)
                .reduce(0, Integer::sum);
    }

    private boolean matchesKeyword(SanPham sanPham, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }
        return sanPham.getTenSanPham() != null
                && sanPham.getTenSanPham().toLowerCase().contains(keyword.trim().toLowerCase());
    }

    private boolean matchesCategory(SanPham sanPham, Integer categoryId) {
        if (categoryId == null) {
            return true;
        }
        return sanPham.getDanhMuc() != null && categoryId.equals(sanPham.getDanhMuc().getMaDanhMuc());
    }

    private boolean matchesProvince(SanPham sanPham, String province) {
        if (province == null || province.isBlank()) {
            return true;
        }
        return sanPham.getTenTinh() != null
                && sanPham.getTenTinh().toLowerCase().contains(province.trim().toLowerCase());
    }

    private boolean matchesMinPrice(SanPham sanPham, BigDecimal minPrice) {
        if (minPrice == null) {
            return true;
        }
        return getLowestPrice(sanPham, getActiveVariants(sanPham)).compareTo(minPrice) >= 0;
    }

    private boolean matchesMaxPrice(SanPham sanPham, BigDecimal maxPrice) {
        if (maxPrice == null) {
            return true;
        }
        return getLowestPrice(sanPham, getActiveVariants(sanPham)).compareTo(maxPrice) <= 0;
    }
}
