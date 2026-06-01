package com.example.dacsanmientrung_backend.service;

import com.example.dacsanmientrung_backend.dto.request.ApplyVoucherRequest;
import com.example.dacsanmientrung_backend.dto.request.VoucherRequest;
import com.example.dacsanmientrung_backend.dto.response.ApplyVoucherResponse;
import com.example.dacsanmientrung_backend.dto.response.VoucherResponse;

import java.util.List;

public interface VoucherService {

    List<VoucherResponse> getActiveVouchers();

    ApplyVoucherResponse applyVoucher(ApplyVoucherRequest request);

    List<VoucherResponse> getAllVouchers(String status, String keyword);

    VoucherResponse getVoucherById(Integer maVoucher);

    VoucherResponse createVoucher(VoucherRequest request);

    VoucherResponse updateVoucher(Integer maVoucher, VoucherRequest request);

    VoucherResponse toggleVoucher(Integer maVoucher);

    VoucherResponse deleteVoucher(Integer maVoucher);
}
