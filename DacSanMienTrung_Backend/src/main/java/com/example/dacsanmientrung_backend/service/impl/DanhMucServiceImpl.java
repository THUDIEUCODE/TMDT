package com.example.dacsanmientrung_backend.service.impl;

import com.example.dacsanmientrung_backend.dto.request.DanhMucRequest;
import com.example.dacsanmientrung_backend.dto.response.DanhMucResponse;
import com.example.dacsanmientrung_backend.entity.DanhMuc;
import com.example.dacsanmientrung_backend.exception.BadRequestException;
import com.example.dacsanmientrung_backend.exception.ResourceNotFoundException;
import com.example.dacsanmientrung_backend.repository.DanhMucRepository;
import com.example.dacsanmientrung_backend.repository.SanPhamRepository;
import com.example.dacsanmientrung_backend.service.DanhMucService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DanhMucServiceImpl implements DanhMucService {

    private final DanhMucRepository danhMucRepository;
    private final SanPhamRepository sanPhamRepository;

    public DanhMucServiceImpl(
            DanhMucRepository danhMucRepository,
            SanPhamRepository sanPhamRepository
    ) {
        this.danhMucRepository = danhMucRepository;
        this.sanPhamRepository = sanPhamRepository;
    }

    @Override
    public List<DanhMucResponse> getAllActiveCategories() {
        return getRootCategories();
    }

    @Override
    public List<DanhMucResponse> getManageCategories() {
        return danhMucRepository.findAllByOrderByThuTuHienThiAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public DanhMucResponse getManageCategoryById(Integer id) {
        DanhMuc danhMuc = danhMucRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay danh muc voi ma: " + id));

        return toResponse(danhMuc);
    }

    @Override
    public List<DanhMucResponse> getRootCategories() {
        return danhMucRepository.findByDanhMucChaIsNullAndTrangThaiTrueOrderByThuTuHienThiAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<DanhMucResponse> getChildCategories(Integer parentId) {
        danhMucRepository.findByMaDanhMucAndTrangThaiTrue(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay danh muc voi ma: " + parentId));

        return danhMucRepository.findByDanhMucCha_MaDanhMucAndTrangThaiTrueOrderByThuTuHienThiAsc(parentId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public DanhMucResponse getCategoryById(Integer id) {
        DanhMuc danhMuc = danhMucRepository.findByMaDanhMucAndTrangThaiTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với mã: " + id));
        return toResponse(danhMuc);
    }

    @Override
    @Transactional
    public DanhMucResponse createCategory(DanhMucRequest request) {
        validateCategoryRequest(request);

        DanhMuc danhMuc = new DanhMuc();
        applyCategoryRequest(danhMuc, request);
        danhMuc.setTrangThai(request.getTrangThai() != null ? request.getTrangThai() : true);

        return toResponse(danhMucRepository.save(danhMuc));
    }

    @Override
    @Transactional
    public DanhMucResponse updateCategory(Integer id, DanhMucRequest request) {
        validateCategoryRequest(request);

        DanhMuc danhMuc = danhMucRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay danh muc voi ma: " + id));

        if (request.getMaDanhMucCha() != null && request.getMaDanhMucCha().equals(id)) {
            throw new BadRequestException("Danh muc khong duoc lam cha cua chinh no");
        }

        applyCategoryRequest(danhMuc, request);
        danhMuc.setTrangThai(request.getTrangThai() != null ? request.getTrangThai() : danhMuc.getTrangThai());

        return toResponse(danhMucRepository.save(danhMuc));
    }

    @Override
    @Transactional
    public DanhMucResponse toggleCategory(Integer id) {
        DanhMuc danhMuc = danhMucRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay danh muc voi ma: " + id));
        danhMuc.setTrangThai(!Boolean.TRUE.equals(danhMuc.getTrangThai()));
        return toResponse(danhMucRepository.save(danhMuc));
    }

    @Override
    @Transactional
    public void softDeleteCategory(Integer id) {
        DanhMuc danhMuc = danhMucRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay danh muc voi ma: " + id));
        danhMuc.setTrangThai(false);
        danhMucRepository.save(danhMuc);
    }

    private void validateCategoryRequest(DanhMucRequest request) {
        if (request == null) {
            throw new BadRequestException("Du lieu danh muc khong duoc rong");
        }

        if (request.getTenDanhMuc() == null || request.getTenDanhMuc().isBlank()) {
            throw new BadRequestException("Ten danh muc khong duoc rong");
        }
    }

    private void applyCategoryRequest(DanhMuc danhMuc, DanhMucRequest request) {
        DanhMuc danhMucCha = null;
        if (request.getMaDanhMucCha() != null) {
            danhMucCha = danhMucRepository.findById(request.getMaDanhMucCha())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay danh muc cha voi ma: " + request.getMaDanhMucCha()));
        }

        danhMuc.setDanhMucCha(danhMucCha);
        danhMuc.setTenDanhMuc(request.getTenDanhMuc().trim());
        danhMuc.setMoTa(request.getMoTa());
        danhMuc.setHinhAnh(request.getHinhAnh());
        danhMuc.setThuTuHienThi(request.getThuTuHienThi());
    }

    private DanhMucResponse toResponse(DanhMuc danhMuc) {
        Integer maDanhMucCha = null;
        if (danhMuc.getDanhMucCha() != null) {
            maDanhMucCha = danhMuc.getDanhMucCha().getMaDanhMuc();
        }

        Integer maDanhMuc = danhMuc.getMaDanhMuc();
        List<DanhMuc> danhMucCon = danhMucRepository.findByDanhMucCha_MaDanhMucAndTrangThaiTrueOrderByThuTuHienThiAsc(maDanhMuc);
        int soDanhMucCon = Math.toIntExact(danhMucRepository.countByDanhMucCha_MaDanhMucAndTrangThaiTrue(maDanhMuc));
        int soSanPham = calculateProductCount(maDanhMuc, danhMucCon);

        return new DanhMucResponse(
                maDanhMuc,
                maDanhMucCha,
                danhMuc.getTenDanhMuc(),
                danhMuc.getMoTa(),
                danhMuc.getHinhAnh(),
                danhMuc.getThuTuHienThi(),
                danhMuc.getTrangThai(),
                soSanPham,
                soDanhMucCon
        );
    }

    private int calculateProductCount(Integer maDanhMuc, List<DanhMuc> danhMucCon) {
        if (danhMucCon.isEmpty()) {
            return Math.toIntExact(sanPhamRepository.countByDanhMuc_MaDanhMucAndTrangThaiTrue(maDanhMuc));
        }

        List<Integer> maDanhMucs = danhMucCon.stream()
                .map(DanhMuc::getMaDanhMuc)
                .collect(Collectors.toCollection(ArrayList::new));
        maDanhMucs.add(maDanhMuc);

        return Math.toIntExact(sanPhamRepository.countByDanhMuc_MaDanhMucInAndTrangThaiTrue(maDanhMucs));
    }
}
