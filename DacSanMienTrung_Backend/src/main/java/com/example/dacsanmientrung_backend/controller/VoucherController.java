package com.example.dacsanmientrung_backend.controller;

import com.example.dacsanmientrung_backend.dto.request.ApplyVoucherRequest;
import com.example.dacsanmientrung_backend.dto.request.VoucherRequest;
import com.example.dacsanmientrung_backend.dto.response.ApplyVoucherResponse;
import com.example.dacsanmientrung_backend.dto.response.VoucherResponse;
import com.example.dacsanmientrung_backend.service.VoucherService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
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
@RequestMapping("/api/vouchers")
public class VoucherController {

    private final VoucherService voucherService;

    public VoucherController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    @GetMapping("/active")
    public List<VoucherResponse> getActiveVouchers() {
        return voucherService.getActiveVouchers();
    }

    @PostMapping("/apply")
    public ApplyVoucherResponse applyVoucher(@Valid @RequestBody ApplyVoucherRequest request) {
        return voucherService.applyVoucher(request);
    }

    @GetMapping
    public List<VoucherResponse> getAllVouchers(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword
    ) {
        return voucherService.getAllVouchers(status, keyword);
    }

    @GetMapping("/{maVoucher}")
    public VoucherResponse getVoucherById(@PathVariable Integer maVoucher) {
        return voucherService.getVoucherById(maVoucher);
    }

    @PostMapping
    public VoucherResponse createVoucher(@Valid @RequestBody VoucherRequest request) {
        return voucherService.createVoucher(request);
    }

    @PutMapping("/{maVoucher}")
    public VoucherResponse updateVoucher(@PathVariable Integer maVoucher, @Valid @RequestBody VoucherRequest request) {
        return voucherService.updateVoucher(maVoucher, request);
    }

    @PutMapping("/{maVoucher}/toggle")
    public VoucherResponse toggleVoucher(@PathVariable Integer maVoucher) {
        return voucherService.toggleVoucher(maVoucher);
    }

    @DeleteMapping("/{maVoucher}")
    public VoucherResponse deleteVoucher(@PathVariable Integer maVoucher) {
        return voucherService.deleteVoucher(maVoucher);
    }
}
