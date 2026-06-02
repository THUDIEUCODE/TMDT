package com.example.dacsanmientrung_backend.service;

import com.example.dacsanmientrung_backend.dto.request.ImportStockRequest;
import com.example.dacsanmientrung_backend.dto.request.UpdateStockRequest;
import com.example.dacsanmientrung_backend.dto.response.InventoryResponse;
import com.example.dacsanmientrung_backend.dto.response.InventorySummaryResponse;

import java.util.List;

public interface InventoryService {

    List<InventoryResponse> getInventory(String keyword, Integer categoryId, String province, String status);

    InventorySummaryResponse getSummary();

    InventoryResponse getInventoryByVariantId(Integer maBienThe);

    InventoryResponse updateStock(Integer maBienThe, UpdateStockRequest request);

    InventoryResponse importStock(Integer maBienThe, ImportStockRequest request);
}
