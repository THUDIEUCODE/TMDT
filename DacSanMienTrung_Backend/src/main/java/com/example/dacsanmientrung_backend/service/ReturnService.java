package com.example.dacsanmientrung_backend.service;

import com.example.dacsanmientrung_backend.dto.request.CreateReturnRequest;
import com.example.dacsanmientrung_backend.dto.request.ProcessReturnRequest;
import com.example.dacsanmientrung_backend.dto.response.ReturnResponse;

import java.util.List;

public interface ReturnService {

    ReturnResponse createReturnRequest(CreateReturnRequest request);

    List<ReturnResponse> getReturns(String status, String keyword);

    ReturnResponse getReturnByOrderId(Integer maDonHang);

    ReturnResponse approveReturn(Integer maDonHang, ProcessReturnRequest request);

    ReturnResponse rejectReturn(Integer maDonHang, ProcessReturnRequest request);

    ReturnResponse refundReturn(Integer maDonHang, ProcessReturnRequest request);
}
