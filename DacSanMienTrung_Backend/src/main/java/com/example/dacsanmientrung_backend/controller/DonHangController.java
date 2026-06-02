package com.example.dacsanmientrung_backend.controller;

import com.example.dacsanmientrung_backend.dto.request.CancelOrderRequest;
import com.example.dacsanmientrung_backend.dto.request.ConfirmBankTransferRequest;
import com.example.dacsanmientrung_backend.dto.request.ConfirmReceivedRequest;
import com.example.dacsanmientrung_backend.dto.request.ConfirmWalletPaymentRequest;
import com.example.dacsanmientrung_backend.dto.request.CreateOrderRequest;
import com.example.dacsanmientrung_backend.dto.response.OrderDetailResponse;
import com.example.dacsanmientrung_backend.dto.response.OrderResponse;
import com.example.dacsanmientrung_backend.service.DonHangService;
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
@RequestMapping("/api/orders")
public class DonHangController {

    private final DonHangService donHangService;

    public DonHangController(DonHangService donHangService) {
        this.donHangService = donHangService;
    }

    @PostMapping
    public OrderDetailResponse createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return donHangService.createOrder(request);
    }

    @GetMapping("/user/{maNguoiDung}")
    public List<OrderResponse> getOrdersByUser(
            @PathVariable Integer maNguoiDung,
            @RequestParam(required = false) String status
    ) {
        return donHangService.getOrdersByUser(maNguoiDung, status);
    }

    @GetMapping("/{maDonHang}")
    public OrderDetailResponse getOrderById(@PathVariable Integer maDonHang) {
        return donHangService.getOrderById(maDonHang);
    }

    @PutMapping("/{maDonHang}/cancel")
    public OrderDetailResponse cancelOrder(
            @PathVariable Integer maDonHang,
            @RequestBody(required = false) CancelOrderRequest request
    ) {
        return donHangService.cancelOrder(maDonHang, request);
    }

    @GetMapping
    public List<OrderResponse> getAllOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword
    ) {
        return donHangService.getAllOrders(status, keyword);
    }

    @PutMapping("/{maDonHang}/status")
    public OrderDetailResponse updateOrderStatus(
            @PathVariable Integer maDonHang,
            @RequestParam String status
    ) {
        return donHangService.updateOrderStatus(maDonHang, status);
    }

    @PutMapping("/{maDonHang}/confirm-received")
    public OrderDetailResponse confirmReceived(
            @PathVariable Integer maDonHang,
            @RequestBody ConfirmReceivedRequest request
    ) {
        return donHangService.confirmReceived(maDonHang, request);
    }

    @PutMapping("/{maDonHang}/confirm-bank-transfer")
    public OrderDetailResponse confirmBankTransfer(
            @PathVariable Integer maDonHang,
            @RequestBody ConfirmBankTransferRequest request
    ) {
        return donHangService.confirmBankTransfer(maDonHang, request);
    }

    @PutMapping("/{maDonHang}/confirm-wallet-payment")
    public OrderDetailResponse confirmWalletPayment(
            @PathVariable Integer maDonHang,
            @RequestBody ConfirmWalletPaymentRequest request
    ) {
        return donHangService.confirmWalletPayment(maDonHang, request);
    }
}
