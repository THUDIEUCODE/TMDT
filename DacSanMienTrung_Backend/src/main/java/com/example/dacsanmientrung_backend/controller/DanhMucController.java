package com.example.dacsanmientrung_backend.controller;

import com.example.dacsanmientrung_backend.dto.response.DanhMucResponse;
import com.example.dacsanmientrung_backend.service.DanhMucService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class DanhMucController {

    private final DanhMucService danhMucService;

    public DanhMucController(DanhMucService danhMucService) {
        this.danhMucService = danhMucService;
    }

    @GetMapping
    public List<DanhMucResponse> getCategories() {
        return danhMucService.getAllActiveCategories();
    }

    @GetMapping("/root")
    public List<DanhMucResponse> getRootCategories() {
        return danhMucService.getRootCategories();
    }

    @GetMapping("/{id}/children")
    public List<DanhMucResponse> getChildCategories(@PathVariable Integer id) {
        return danhMucService.getChildCategories(id);
    }

    @GetMapping("/{id}")
    public DanhMucResponse getCategoryById(@PathVariable Integer id) {
        return danhMucService.getCategoryById(id);
    }
}
