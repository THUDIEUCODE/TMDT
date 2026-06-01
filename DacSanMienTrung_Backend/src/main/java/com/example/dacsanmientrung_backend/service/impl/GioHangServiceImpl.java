package com.example.dacsanmientrung_backend.service.impl;

import com.example.dacsanmientrung_backend.dto.request.AddToCartRequest;
import com.example.dacsanmientrung_backend.dto.request.UpdateCartItemRequest;
import com.example.dacsanmientrung_backend.dto.response.CartItemResponse;
import com.example.dacsanmientrung_backend.dto.response.CartResponse;
import com.example.dacsanmientrung_backend.entity.BienThe;
import com.example.dacsanmientrung_backend.entity.GioHang;
import com.example.dacsanmientrung_backend.entity.NguoiDung;
import com.example.dacsanmientrung_backend.entity.SanPham;
import com.example.dacsanmientrung_backend.exception.BadRequestException;
import com.example.dacsanmientrung_backend.exception.ResourceNotFoundException;
import com.example.dacsanmientrung_backend.repository.BienTheRepository;
import com.example.dacsanmientrung_backend.repository.GioHangRepository;
import com.example.dacsanmientrung_backend.repository.NguoiDungRepository;
import com.example.dacsanmientrung_backend.service.GioHangService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class GioHangServiceImpl implements GioHangService {

    private final GioHangRepository gioHangRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final BienTheRepository bienTheRepository;

    public GioHangServiceImpl(
            GioHangRepository gioHangRepository,
            NguoiDungRepository nguoiDungRepository,
            BienTheRepository bienTheRepository
    ) {
        this.gioHangRepository = gioHangRepository;
        this.nguoiDungRepository = nguoiDungRepository;
        this.bienTheRepository = bienTheRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(Integer maNguoiDung) {
        ensureUserExists(maNguoiDung);
        return buildCartResponse(maNguoiDung);
    }

    @Override
    @Transactional
    public CartResponse addToCart(AddToCartRequest request) {
        NguoiDung nguoiDung = getUser(request.getMaNguoiDung());
        BienThe bienThe = getActiveVariant(request.getMaBienThe());

        int newQuantity = request.getSoLuong();
        GioHang gioHang = gioHangRepository
                .findByNguoiDung_MaNguoiDungAndBienThe_MaBienThe(request.getMaNguoiDung(), request.getMaBienThe())
                .orElse(null);

        if (gioHang != null) {
            newQuantity += gioHang.getSoLuong();
        }

        validateStock(bienThe, newQuantity);

        if (gioHang == null) {
            gioHang = new GioHang();
            gioHang.setNguoiDung(nguoiDung);
            gioHang.setBienThe(bienThe);
            gioHang.setDonGia(bienThe.getGiaBan());
            gioHang.setNgayThem(LocalDateTime.now());
        }

        gioHang.setSoLuong(newQuantity);
        gioHangRepository.save(gioHang);

        return buildCartResponse(request.getMaNguoiDung());
    }

    @Override
    @Transactional
    public CartResponse updateCartItem(Integer maGioHang, UpdateCartItemRequest request) {
        GioHang gioHang = getCartItem(maGioHang);
        validateStock(gioHang.getBienThe(), request.getSoLuong());

        gioHang.setSoLuong(request.getSoLuong());
        gioHangRepository.save(gioHang);

        return buildCartResponse(gioHang.getNguoiDung().getMaNguoiDung());
    }

    @Override
    @Transactional
    public CartResponse removeCartItem(Integer maGioHang) {
        GioHang gioHang = getCartItem(maGioHang);
        Integer maNguoiDung = gioHang.getNguoiDung().getMaNguoiDung();

        gioHangRepository.delete(gioHang);
        return buildCartResponse(maNguoiDung);
    }

    @Override
    @Transactional
    public CartResponse clearCart(Integer maNguoiDung) {
        ensureUserExists(maNguoiDung);
        gioHangRepository.deleteByNguoiDung_MaNguoiDung(maNguoiDung);
        return buildCartResponse(maNguoiDung);
    }

    private CartResponse buildCartResponse(Integer maNguoiDung) {
        List<CartItemResponse> items = gioHangRepository.findByNguoiDung_MaNguoiDung(maNguoiDung)
                .stream()
                .map(this::toCartItemResponse)
                .toList();

        Integer tongSoLuong = items.stream()
                .map(CartItemResponse::getSoLuong)
                .reduce(0, Integer::sum);

        BigDecimal tongTien = items.stream()
                .map(CartItemResponse::getThanhTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(maNguoiDung, items, tongSoLuong, tongTien);
    }

    private CartItemResponse toCartItemResponse(GioHang gioHang) {
        BienThe bienThe = gioHang.getBienThe();
        SanPham sanPham = bienThe.getSanPham();
        BigDecimal thanhTien = gioHang.getDonGia().multiply(BigDecimal.valueOf(gioHang.getSoLuong()));

        String hinhAnh = bienThe.getHinhAnh() != null ? bienThe.getHinhAnh() : sanPham.getHinhAnh();

        return new CartItemResponse(
                gioHang.getMaGioHang(),
                gioHang.getNguoiDung().getMaNguoiDung(),
                bienThe.getMaBienThe(),
                sanPham.getMaSanPham(),
                sanPham.getTenSanPham(),
                bienThe.getTrongLuong(),
                bienThe.getQuyCachDongGoi(),
                hinhAnh,
                gioHang.getDonGia(),
                gioHang.getSoLuong(),
                thanhTien,
                bienThe.getSoLuongTon()
        );
    }

    private NguoiDung getUser(Integer maNguoiDung) {
        return nguoiDungRepository.findById(maNguoiDung)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với mã: " + maNguoiDung));
    }

    private void ensureUserExists(Integer maNguoiDung) {
        if (!nguoiDungRepository.existsById(maNguoiDung)) {
            throw new ResourceNotFoundException("Không tìm thấy người dùng với mã: " + maNguoiDung);
        }
    }

    private BienThe getActiveVariant(Integer maBienThe) {
        return bienTheRepository.findByMaBienTheAndTrangThaiTrue(maBienThe)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy biến thể đang hoạt động với mã: " + maBienThe));
    }

    private GioHang getCartItem(Integer maGioHang) {
        return gioHangRepository.findById(maGioHang)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dòng giỏ hàng với mã: " + maGioHang));
    }

    private void validateStock(BienThe bienThe, Integer requestedQuantity) {
        if (requestedQuantity == null || requestedQuantity <= 0) {
            throw new BadRequestException("Số lượng phải lớn hơn 0");
        }
        if (bienThe.getSoLuongTon() == null || bienThe.getSoLuongTon() < requestedQuantity) {
            throw new BadRequestException("Tồn kho không đủ");
        }
    }
}
