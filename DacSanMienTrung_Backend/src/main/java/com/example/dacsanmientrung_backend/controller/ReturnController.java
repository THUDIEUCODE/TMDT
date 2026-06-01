package com.example.dacsanmientrung_backend.controller;

import com.example.dacsanmientrung_backend.dto.request.CreateReturnRequest;
import com.example.dacsanmientrung_backend.dto.request.ProcessReturnRequest;
import com.example.dacsanmientrung_backend.dto.response.ReturnResponse;
import com.example.dacsanmientrung_backend.service.ReturnService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/returns")
public class ReturnController {

    private final ReturnService returnService;

    public ReturnController(ReturnService returnService) {
        this.returnService = returnService;
    }

    @PostMapping
    public ReturnResponse createReturnRequest(@Valid @RequestBody CreateReturnRequest request) {
        return returnService.createReturnRequest(request);
    }

    @GetMapping
    public List<ReturnResponse> getReturns(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword
    ) {
        return returnService.getReturns(status, keyword);
    }

    @GetMapping("/{maDonHang}")
    public ReturnResponse getReturnByOrderId(@PathVariable Integer maDonHang) {
        return returnService.getReturnByOrderId(maDonHang);
    }

    @PutMapping("/{maDonHang}/approve")
    public ReturnResponse approveReturn(
            @PathVariable Integer maDonHang,
            @Valid @RequestBody ProcessReturnRequest request
    ) {
        return returnService.approveReturn(maDonHang, request);
    }

    @PutMapping("/{maDonHang}/reject")
    public ReturnResponse rejectReturn(
            @PathVariable Integer maDonHang,
            @Valid @RequestBody ProcessReturnRequest request
    ) {
        return returnService.rejectReturn(maDonHang, request);
    }

    @PutMapping("/{maDonHang}/refund")
    public ReturnResponse refundReturn(
            @PathVariable Integer maDonHang,
            @Valid @RequestBody ProcessReturnRequest request
    ) {
        return returnService.refundReturn(maDonHang, request);
    }
}
