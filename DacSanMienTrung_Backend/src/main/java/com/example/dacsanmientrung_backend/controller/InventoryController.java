package com.example.dacsanmientrung_backend.controller;

import com.example.dacsanmientrung_backend.dto.request.ImportStockRequest;
import com.example.dacsanmientrung_backend.dto.request.UpdateStockRequest;
import com.example.dacsanmientrung_backend.dto.response.InventoryResponse;
import com.example.dacsanmientrung_backend.dto.response.InventorySummaryResponse;
import com.example.dacsanmientrung_backend.service.InventoryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public List<InventoryResponse> getInventory(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String province,
            @RequestParam(required = false) String status
    ) {
        return inventoryService.getInventory(keyword, categoryId, province, status);
    }

    @GetMapping("/summary")
    public InventorySummaryResponse getSummary() {
        return inventoryService.getSummary();
    }

    @GetMapping("/{maBienThe}")
    public InventoryResponse getInventoryByVariantId(@PathVariable Integer maBienThe) {
        return inventoryService.getInventoryByVariantId(maBienThe);
    }

    @PutMapping("/{maBienThe}/stock")
    public InventoryResponse updateStock(
            @PathVariable Integer maBienThe,
            @RequestBody UpdateStockRequest request
    ) {
        return inventoryService.updateStock(maBienThe, request);
    }

    @PutMapping("/{maBienThe}/import")
    public InventoryResponse importStock(
            @PathVariable Integer maBienThe,
            @RequestBody ImportStockRequest request
    ) {
        return inventoryService.importStock(maBienThe, request);
    }
}
