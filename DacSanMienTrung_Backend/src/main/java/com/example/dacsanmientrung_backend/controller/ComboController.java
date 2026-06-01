package com.example.dacsanmientrung_backend.controller;

import com.example.dacsanmientrung_backend.dto.request.AddComboItemRequest;
import com.example.dacsanmientrung_backend.dto.request.CreateComboRequest;
import com.example.dacsanmientrung_backend.dto.request.UpdateComboItemRequest;
import com.example.dacsanmientrung_backend.dto.request.UpdateComboRequest;
import com.example.dacsanmientrung_backend.dto.response.ComboDetailResponse;
import com.example.dacsanmientrung_backend.dto.response.ComboResponse;
import com.example.dacsanmientrung_backend.service.ComboService;
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
@RequestMapping("/api/combos")
public class ComboController {

    private final ComboService comboService;

    public ComboController(ComboService comboService) {
        this.comboService = comboService;
    }

    @PostMapping
    public ComboDetailResponse createCombo(@Valid @RequestBody CreateComboRequest request) {
        return comboService.createCombo(request);
    }

    @GetMapping("/user/{maNguoiDung}")
    public List<ComboResponse> getCombosByUser(
            @PathVariable Integer maNguoiDung,
            @RequestParam(required = false) String status
    ) {
        return comboService.getCombosByUser(maNguoiDung, status);
    }

    @GetMapping("/{maCombo}")
    public ComboDetailResponse getComboById(@PathVariable Integer maCombo) {
        return comboService.getComboById(maCombo);
    }

    @PutMapping("/{maCombo}")
    public ComboDetailResponse updateCombo(@PathVariable Integer maCombo, @Valid @RequestBody UpdateComboRequest request) {
        return comboService.updateCombo(maCombo, request);
    }

    @PostMapping("/{maCombo}/items")
    public ComboDetailResponse addItem(@PathVariable Integer maCombo, @Valid @RequestBody AddComboItemRequest request) {
        return comboService.addItem(maCombo, request);
    }

    @PutMapping("/items/{maChiTietCombo}")
    public ComboDetailResponse updateItem(
            @PathVariable Integer maChiTietCombo,
            @Valid @RequestBody UpdateComboItemRequest request
    ) {
        return comboService.updateItem(maChiTietCombo, request);
    }

    @DeleteMapping("/items/{maChiTietCombo}")
    public ComboDetailResponse deleteItem(@PathVariable Integer maChiTietCombo) {
        return comboService.deleteItem(maChiTietCombo);
    }

    @PutMapping("/{maCombo}/cancel")
    public ComboDetailResponse cancelCombo(@PathVariable Integer maCombo) {
        return comboService.cancelCombo(maCombo);
    }

    @PutMapping("/{maCombo}/mark-ordered")
    public ComboDetailResponse markOrdered(@PathVariable Integer maCombo) {
        return comboService.markOrdered(maCombo);
    }

    @GetMapping
    public List<ComboResponse> getAllCombos(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword
    ) {
        return comboService.getAllCombos(status, keyword);
    }
}
