package com.example.dacsanmientrung_backend.controller;

import com.example.dacsanmientrung_backend.dto.request.AddToCartRequest;
import com.example.dacsanmientrung_backend.dto.request.UpdateCartItemRequest;
import com.example.dacsanmientrung_backend.dto.response.CartResponse;
import com.example.dacsanmientrung_backend.service.GioHangService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
public class GioHangController {

    private final GioHangService gioHangService;

    public GioHangController(GioHangService gioHangService) {
        this.gioHangService = gioHangService;
    }

    @GetMapping("/{maNguoiDung}")
    public CartResponse getCart(@PathVariable Integer maNguoiDung) {
        return gioHangService.getCart(maNguoiDung);
    }

    @PostMapping("/add")
    public CartResponse addToCart(@Valid @RequestBody AddToCartRequest request) {
        return gioHangService.addToCart(request);
    }

    @PutMapping("/items/{maGioHang}")
    public CartResponse updateCartItem(
            @PathVariable Integer maGioHang,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        return gioHangService.updateCartItem(maGioHang, request);
    }

    @DeleteMapping("/items/{maGioHang}")
    public CartResponse removeCartItem(@PathVariable Integer maGioHang) {
        return gioHangService.removeCartItem(maGioHang);
    }

    @DeleteMapping("/clear/{maNguoiDung}")
    public CartResponse clearCart(@PathVariable Integer maNguoiDung) {
        return gioHangService.clearCart(maNguoiDung);
    }
}
