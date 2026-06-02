package com.example.dacsanmientrung_backend.service;

import com.example.dacsanmientrung_backend.dto.request.BienTheRequest;
import com.example.dacsanmientrung_backend.dto.response.BienTheResponse;

import java.util.List;

public interface BienTheService {

    List<BienTheResponse> getVariantsByProduct(Integer maSanPham);

    BienTheResponse createVariant(BienTheRequest request);

    BienTheResponse updateVariant(Integer id, BienTheRequest request);

    BienTheResponse toggleVariant(Integer id);

    void softDeleteVariant(Integer id);
}
