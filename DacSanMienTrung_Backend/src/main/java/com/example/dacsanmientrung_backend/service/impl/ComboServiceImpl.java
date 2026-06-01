package com.example.dacsanmientrung_backend.service.impl;

import com.example.dacsanmientrung_backend.dto.request.AddComboItemRequest;
import com.example.dacsanmientrung_backend.dto.request.ComboItemRequest;
import com.example.dacsanmientrung_backend.dto.request.CreateComboRequest;
import com.example.dacsanmientrung_backend.dto.request.UpdateComboItemRequest;
import com.example.dacsanmientrung_backend.dto.request.UpdateComboRequest;
import com.example.dacsanmientrung_backend.dto.response.ComboDetailResponse;
import com.example.dacsanmientrung_backend.dto.response.ComboItemResponse;
import com.example.dacsanmientrung_backend.dto.response.ComboResponse;
import com.example.dacsanmientrung_backend.entity.BienThe;
import com.example.dacsanmientrung_backend.entity.ChiTietCombo;
import com.example.dacsanmientrung_backend.entity.ComboQuaTang;
import com.example.dacsanmientrung_backend.entity.NguoiDung;
import com.example.dacsanmientrung_backend.entity.SanPham;
import com.example.dacsanmientrung_backend.exception.BadRequestException;
import com.example.dacsanmientrung_backend.exception.ResourceNotFoundException;
import com.example.dacsanmientrung_backend.repository.BienTheRepository;
import com.example.dacsanmientrung_backend.repository.ChiTietComboRepository;
import com.example.dacsanmientrung_backend.repository.ComboQuaTangRepository;
import com.example.dacsanmientrung_backend.repository.NguoiDungRepository;
import com.example.dacsanmientrung_backend.service.ComboService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ComboServiceImpl implements ComboService {

    private static final String STATUS_LUU_TAM = "luuTam";
    private static final String STATUS_DA_DAT_HANG = "daDatHang";
    private static final String STATUS_DA_HUY = "daHuy";

    private final ComboQuaTangRepository comboQuaTangRepository;
    private final ChiTietComboRepository chiTietComboRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final BienTheRepository bienTheRepository;

    public ComboServiceImpl(
            ComboQuaTangRepository comboQuaTangRepository,
            ChiTietComboRepository chiTietComboRepository,
            NguoiDungRepository nguoiDungRepository,
            BienTheRepository bienTheRepository
    ) {
        this.comboQuaTangRepository = comboQuaTangRepository;
        this.chiTietComboRepository = chiTietComboRepository;
        this.nguoiDungRepository = nguoiDungRepository;
        this.bienTheRepository = bienTheRepository;
    }

    @Override
    @Transactional
    public ComboDetailResponse createCombo(CreateComboRequest request) {
        NguoiDung user = getUser(request.getMaNguoiDung());

        ComboQuaTang combo = new ComboQuaTang();
        combo.setNguoiDung(user);
        combo.setTenCombo(validateText(request.getTenCombo(), "Tên combo không được rỗng"));
        combo.setLoaiCombo(validateText(request.getLoaiCombo(), "Loại combo không được rỗng"));
        combo.setDipLe(request.getDipLe());
        combo.setLoiNhan(request.getLoiNhan());
        combo.setTongTienTamTinh(BigDecimal.ZERO);
        combo.setTrangThaiCombo(STATUS_LUU_TAM);
        combo.setNgayTao(LocalDateTime.now());

        ComboQuaTang savedCombo = comboQuaTangRepository.save(combo);
        if (request.getItems() != null) {
            for (ComboItemRequest item : request.getItems()) {
                addOrMergeItem(savedCombo, item.getMaBienThe(), item.getSoLuong(), item.getGhiChuSanPham());
            }
        }
        recalculateTotal(savedCombo);
        return toDetailResponse(savedCombo);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComboResponse> getCombosByUser(Integer maNguoiDung, String status) {
        getUser(maNguoiDung);
        List<ComboQuaTang> combos = status == null || status.isBlank()
                ? comboQuaTangRepository.findByNguoiDung_MaNguoiDungOrderByNgayTaoDesc(maNguoiDung)
                : comboQuaTangRepository.findByNguoiDung_MaNguoiDungAndTrangThaiComboOrderByNgayTaoDesc(maNguoiDung, status);
        return combos.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ComboDetailResponse getComboById(Integer maCombo) {
        return toDetailResponse(getCombo(maCombo));
    }

    @Override
    @Transactional
    public ComboDetailResponse updateCombo(Integer maCombo, UpdateComboRequest request) {
        ComboQuaTang combo = getCombo(maCombo);
        ensureEditable(combo);

        combo.setTenCombo(validateText(request.getTenCombo(), "Tên combo không được rỗng"));
        combo.setLoaiCombo(validateText(request.getLoaiCombo(), "Loại combo không được rỗng"));
        combo.setDipLe(request.getDipLe());
        combo.setLoiNhan(request.getLoiNhan());
        combo.setNgayCapNhat(LocalDateTime.now());
        return toDetailResponse(comboQuaTangRepository.save(combo));
    }

    @Override
    @Transactional
    public ComboDetailResponse addItem(Integer maCombo, AddComboItemRequest request) {
        ComboQuaTang combo = getCombo(maCombo);
        ensureEditable(combo);
        addOrMergeItem(combo, request.getMaBienThe(), request.getSoLuong(), request.getGhiChuSanPham());
        recalculateTotal(combo);
        return toDetailResponse(combo);
    }

    @Override
    @Transactional
    public ComboDetailResponse updateItem(Integer maChiTietCombo, UpdateComboItemRequest request) {
        ChiTietCombo item = getComboItem(maChiTietCombo);
        ComboQuaTang combo = item.getComboQuaTang();
        ensureEditable(combo);
        validateQuantity(request.getSoLuong());

        item.setSoLuong(request.getSoLuong());
        item.setGhiChuSanPham(request.getGhiChuSanPham());
        item.setThanhTien(item.getDonGia().multiply(BigDecimal.valueOf(request.getSoLuong())));
        chiTietComboRepository.save(item);
        recalculateTotal(combo);
        return toDetailResponse(combo);
    }

    @Override
    @Transactional
    public ComboDetailResponse deleteItem(Integer maChiTietCombo) {
        ChiTietCombo item = getComboItem(maChiTietCombo);
        ComboQuaTang combo = item.getComboQuaTang();
        ensureEditable(combo);

        chiTietComboRepository.delete(item);
        chiTietComboRepository.flush();
        recalculateTotal(combo);
        return toDetailResponse(combo);
    }

    @Override
    @Transactional
    public ComboDetailResponse cancelCombo(Integer maCombo) {
        ComboQuaTang combo = getCombo(maCombo);
        combo.setTrangThaiCombo(STATUS_DA_HUY);
        combo.setNgayCapNhat(LocalDateTime.now());
        return toDetailResponse(comboQuaTangRepository.save(combo));
    }

    @Override
    @Transactional
    public ComboDetailResponse markOrdered(Integer maCombo) {
        ComboQuaTang combo = getCombo(maCombo);
        combo.setTrangThaiCombo(STATUS_DA_DAT_HANG);
        combo.setNgayCapNhat(LocalDateTime.now());
        return toDetailResponse(comboQuaTangRepository.save(combo));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComboResponse> getAllCombos(String status, String keyword) {
        List<ComboQuaTang> combos = status == null || status.isBlank()
                ? comboQuaTangRepository.findAllByOrderByNgayTaoDesc()
                : comboQuaTangRepository.findByTrangThaiComboOrderByNgayTaoDesc(status);
        return combos.stream()
                .filter(combo -> matchesKeyword(combo, keyword))
                .map(this::toResponse)
                .toList();
    }

    private void addOrMergeItem(ComboQuaTang combo, Integer maBienThe, Integer quantity, String note) {
        validateQuantity(quantity);
        BienThe variant = getActiveVariant(maBienThe);
        ChiTietCombo item = chiTietComboRepository
                .findByComboQuaTang_MaComboAndBienThe_MaBienThe(combo.getMaCombo(), maBienThe)
                .orElse(null);

        if (item == null) {
            item = new ChiTietCombo();
            item.setComboQuaTang(combo);
            item.setBienThe(variant);
            item.setDonGia(variant.getGiaBan());
            item.setSoLuong(quantity);
        } else {
            item.setSoLuong(item.getSoLuong() + quantity);
        }

        item.setGhiChuSanPham(note);
        item.setThanhTien(item.getDonGia().multiply(BigDecimal.valueOf(item.getSoLuong())));
        chiTietComboRepository.save(item);
    }

    private void recalculateTotal(ComboQuaTang combo) {
        BigDecimal total = getItems(combo.getMaCombo()).stream()
                .map(ChiTietCombo::getThanhTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        combo.setTongTienTamTinh(total);
        combo.setNgayCapNhat(LocalDateTime.now());
        comboQuaTangRepository.save(combo);
    }

    private ComboResponse toResponse(ComboQuaTang combo) {
        List<ChiTietCombo> items = getItems(combo.getMaCombo());
        Integer totalQuantity = items.stream().map(ChiTietCombo::getSoLuong).reduce(0, Integer::sum);
        return new ComboResponse(
                combo.getMaCombo(),
                combo.getNguoiDung().getMaNguoiDung(),
                combo.getNguoiDung().getHoTen(),
                combo.getTenCombo(),
                combo.getLoaiCombo(),
                combo.getDipLe(),
                combo.getLoiNhan(),
                combo.getTongTienTamTinh(),
                combo.getTrangThaiCombo(),
                combo.getNgayTao(),
                combo.getNgayCapNhat(),
                totalQuantity
        );
    }

    private ComboDetailResponse toDetailResponse(ComboQuaTang combo) {
        List<ComboItemResponse> items = getItems(combo.getMaCombo()).stream()
                .map(this::toItemResponse)
                .toList();
        Integer totalQuantity = items.stream().map(ComboItemResponse::getSoLuong).reduce(0, Integer::sum);
        return new ComboDetailResponse(
                combo.getMaCombo(),
                combo.getNguoiDung().getMaNguoiDung(),
                combo.getNguoiDung().getHoTen(),
                combo.getTenCombo(),
                combo.getLoaiCombo(),
                combo.getDipLe(),
                combo.getLoiNhan(),
                combo.getTongTienTamTinh(),
                combo.getTrangThaiCombo(),
                combo.getNgayTao(),
                combo.getNgayCapNhat(),
                totalQuantity,
                items
        );
    }

    private ComboItemResponse toItemResponse(ChiTietCombo item) {
        BienThe variant = item.getBienThe();
        SanPham product = variant.getSanPham();
        String image = variant.getHinhAnh() != null ? variant.getHinhAnh() : product.getHinhAnh();
        return new ComboItemResponse(
                item.getMaChiTietCombo(),
                item.getComboQuaTang().getMaCombo(),
                variant.getMaBienThe(),
                product.getMaSanPham(),
                product.getTenSanPham(),
                variant.getTrongLuong(),
                variant.getQuyCachDongGoi(),
                image,
                item.getSoLuong(),
                item.getDonGia(),
                item.getThanhTien(),
                item.getGhiChuSanPham()
        );
    }

    private List<ChiTietCombo> getItems(Integer maCombo) {
        return chiTietComboRepository.findByComboQuaTang_MaCombo(maCombo);
    }

    private NguoiDung getUser(Integer maNguoiDung) {
        return nguoiDungRepository.findById(maNguoiDung)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với mã: " + maNguoiDung));
    }

    private ComboQuaTang getCombo(Integer maCombo) {
        return comboQuaTangRepository.findByMaCombo(maCombo)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy combo với mã: " + maCombo));
    }

    private ChiTietCombo getComboItem(Integer maChiTietCombo) {
        return chiTietComboRepository.findById(maChiTietCombo)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi tiết combo với mã: " + maChiTietCombo));
    }

    private BienThe getActiveVariant(Integer maBienThe) {
        return bienTheRepository.findByMaBienTheAndTrangThaiTrue(maBienThe)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy biến thể đang hoạt động với mã: " + maBienThe));
    }

    private void ensureEditable(ComboQuaTang combo) {
        if (!STATUS_LUU_TAM.equals(combo.getTrangThaiCombo())) {
            throw new BadRequestException("Chỉ có thể chỉnh sửa combo đang lưu tạm");
        }
    }

    private void validateQuantity(Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new BadRequestException("Số lượng phải lớn hơn 0");
        }
    }

    private String validateText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(message);
        }
        return value.trim();
    }

    private boolean matchesKeyword(ComboQuaTang combo, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }
        String value = keyword.trim().toLowerCase();
        return contains(combo.getTenCombo(), value)
                || contains(combo.getNguoiDung().getHoTen(), value)
                || contains(combo.getDipLe(), value);
    }

    private boolean contains(String source, String value) {
        return source != null && source.toLowerCase().contains(value);
    }
}
