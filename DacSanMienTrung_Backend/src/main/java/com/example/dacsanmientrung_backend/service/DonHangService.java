package com.example.dacsanmientrung_backend.service;

import com.example.dacsanmientrung_backend.dto.request.CancelOrderRequest;
import com.example.dacsanmientrung_backend.dto.request.ConfirmBankTransferRequest;
import com.example.dacsanmientrung_backend.dto.request.ConfirmReceivedRequest;
import com.example.dacsanmientrung_backend.dto.request.ConfirmWalletPaymentRequest;
import com.example.dacsanmientrung_backend.dto.request.CreateOrderRequest;
import com.example.dacsanmientrung_backend.dto.response.OrderDetailResponse;
import com.example.dacsanmientrung_backend.dto.response.OrderResponse;

import java.util.List;

public interface DonHangService {

    OrderDetailResponse createOrder(CreateOrderRequest request);

    List<OrderResponse> getOrdersByUser(Integer maNguoiDung, String status);

    OrderDetailResponse getOrderById(Integer maDonHang);

    OrderDetailResponse cancelOrder(Integer maDonHang, CancelOrderRequest request);

    List<OrderResponse> getAllOrders(String status, String keyword);

    OrderDetailResponse updateOrderStatus(Integer maDonHang, String status);

    OrderDetailResponse confirmReceived(Integer maDonHang, ConfirmReceivedRequest request);

    OrderDetailResponse confirmBankTransfer(Integer maDonHang, ConfirmBankTransferRequest request);

    OrderDetailResponse confirmWalletPayment(Integer maDonHang, ConfirmWalletPaymentRequest request);
}
