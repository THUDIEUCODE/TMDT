package com.example.dacsanmientrung_backend.controller;

import com.example.dacsanmientrung_backend.dto.request.BienTheRequest;
import com.example.dacsanmientrung_backend.dto.response.BienTheResponse;
import com.example.dacsanmientrung_backend.service.BienTheService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/variants")
public class BienTheController {

    private final BienTheService bienTheService;

    public BienTheController(BienTheService bienTheService) {
        this.bienTheService = bienTheService;
    }

    @GetMapping("/product/{maSanPham}")
    public List<BienTheResponse> getVariantsByProduct(@PathVariable Integer maSanPham) {
        return bienTheService.getVariantsByProduct(maSanPham);
    }

    @PostMapping
    public BienTheResponse createVariant(@RequestBody BienTheRequest request) {
        return bienTheService.createVariant(request);
    }

    @PutMapping("/{id}")
    public BienTheResponse updateVariant(@PathVariable Integer id, @RequestBody BienTheRequest request) {
        return bienTheService.updateVariant(id, request);
    }

    @PutMapping("/{id}/toggle")
    public BienTheResponse toggleVariant(@PathVariable Integer id) {
        return bienTheService.toggleVariant(id);
    }

    @DeleteMapping("/{id}")
    public void softDeleteVariant(@PathVariable Integer id) {
        bienTheService.softDeleteVariant(id);
    }
}
