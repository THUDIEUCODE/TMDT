package com.example.dacsanmientrung_backend.service.impl;

import com.example.dacsanmientrung_backend.dto.response.DanhMucResponse;
import com.example.dacsanmientrung_backend.entity.DanhMuc;
import com.example.dacsanmientrung_backend.exception.ResourceNotFoundException;
import com.example.dacsanmientrung_backend.repository.DanhMucRepository;
import com.example.dacsanmientrung_backend.service.DanhMucService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class DanhMucServiceImpl implements DanhMucService {

    private final DanhMucRepository danhMucRepository;

    public DanhMucServiceImpl(DanhMucRepository danhMucRepository) {
        this.danhMucRepository = danhMucRepository;
    }

    @Override
    public List<DanhMucResponse> getAllActiveCategories() {
        return getRootCategories();
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

    private DanhMucResponse toResponse(DanhMuc danhMuc) {
        Integer maDanhMucCha = null;
        if (danhMuc.getDanhMucCha() != null) {
            maDanhMucCha = danhMuc.getDanhMucCha().getMaDanhMuc();
        }

        return new DanhMucResponse(
                danhMuc.getMaDanhMuc(),
                maDanhMucCha,
                danhMuc.getTenDanhMuc(),
                danhMuc.getMoTa(),
                danhMuc.getThuTuHienThi(),
                danhMuc.getTrangThai()
        );
    }
}
