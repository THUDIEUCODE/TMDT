package com.example.dacsanmientrung_backend.service.impl;

import com.example.dacsanmientrung_backend.dto.request.BienTheRequest;
import com.example.dacsanmientrung_backend.dto.response.BienTheResponse;
import com.example.dacsanmientrung_backend.entity.BienThe;
import com.example.dacsanmientrung_backend.entity.SanPham;
import com.example.dacsanmientrung_backend.exception.BadRequestException;
import com.example.dacsanmientrung_backend.exception.ResourceNotFoundException;
import com.example.dacsanmientrung_backend.repository.BienTheRepository;
import com.example.dacsanmientrung_backend.repository.SanPhamRepository;
import com.example.dacsanmientrung_backend.service.BienTheService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class BienTheServiceImpl implements BienTheService {

    private final BienTheRepository bienTheRepository;
    private final SanPhamRepository sanPhamRepository;

    public BienTheServiceImpl(
            BienTheRepository bienTheRepository,
            SanPhamRepository sanPhamRepository
    ) {
        this.bienTheRepository = bienTheRepository;
        this.sanPhamRepository = sanPhamRepository;
    }

    @Override
    public List<BienTheResponse> getVariantsByProduct(Integer maSanPham) {
        sanPhamRepository.findById(maSanPham)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay san pham voi ma: " + maSanPham));

        return bienTheRepository.findBySanPham_MaSanPham(maSanPham)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public BienTheResponse createVariant(BienTheRequest request) {
        validateVariantRequest(request);

        BienThe bienThe = new BienThe();
        applyVariantRequest(bienThe, request);
        bienThe.setTrangThai(request.getTrangThai() != null ? request.getTrangThai() : true);

        return toResponse(bienTheRepository.save(bienThe));
    }

    @Override
    @Transactional
    public BienTheResponse updateVariant(Integer id, BienTheRequest request) {
        validateVariantRequest(request);

        BienThe bienThe = bienTheRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay bien the voi ma: " + id));
        applyVariantRequest(bienThe, request);
        bienThe.setTrangThai(request.getTrangThai() != null ? request.getTrangThai() : bienThe.getTrangThai());

        return toResponse(bienTheRepository.save(bienThe));
    }

    @Override
    @Transactional
    public BienTheResponse toggleVariant(Integer id) {
        BienThe bienThe = bienTheRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay bien the voi ma: " + id));
        bienThe.setTrangThai(!Boolean.TRUE.equals(bienThe.getTrangThai()));
        return toResponse(bienTheRepository.save(bienThe));
    }

    @Override
    @Transactional
    public void softDeleteVariant(Integer id) {
        BienThe bienThe = bienTheRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay bien the voi ma: " + id));
        bienThe.setTrangThai(false);
        bienTheRepository.save(bienThe);
    }

    private void validateVariantRequest(BienTheRequest request) {
        if (request == null) {
            throw new BadRequestException("Du lieu bien the khong duoc rong");
        }

        if (request.getMaSanPham() == null) {
            throw new BadRequestException("Ma san pham khong duoc rong");
        }

        if (request.getGiaBan() == null || request.getGiaBan().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Gia ban phai lon hon hoac bang 0");
        }

        if (request.getSoLuongTon() == null || request.getSoLuongTon() < 0) {
            throw new BadRequestException("So luong ton phai lon hon hoac bang 0");
        }
    }

    private void applyVariantRequest(BienThe bienThe, BienTheRequest request) {
        SanPham sanPham = sanPhamRepository.findById(request.getMaSanPham())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay san pham voi ma: " + request.getMaSanPham()));

        bienThe.setSanPham(sanPham);
        bienThe.setTrongLuong(request.getTrongLuong());
        bienThe.setQuyCachDongGoi(request.getQuyCachDongGoi());
        bienThe.setGiaBan(request.getGiaBan());
        bienThe.setSoLuongTon(request.getSoLuongTon());
        bienThe.setHanSuDung(request.getHanSuDung());
        bienThe.setHinhAnh(request.getHinhAnh());
    }

    private BienTheResponse toResponse(BienThe bienThe) {
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
}
