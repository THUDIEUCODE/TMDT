package com.example.dacsanmientrung_backend.service;

import com.example.dacsanmientrung_backend.dto.request.AddToCartRequest;
import com.example.dacsanmientrung_backend.dto.request.UpdateCartItemRequest;
import com.example.dacsanmientrung_backend.dto.response.CartResponse;

public interface GioHangService {

    CartResponse getCart(Integer maNguoiDung);

    CartResponse addToCart(AddToCartRequest request);

    CartResponse updateCartItem(Integer maGioHang, UpdateCartItemRequest request);

    CartResponse removeCartItem(Integer maGioHang);

    CartResponse clearCart(Integer maNguoiDung);
}
