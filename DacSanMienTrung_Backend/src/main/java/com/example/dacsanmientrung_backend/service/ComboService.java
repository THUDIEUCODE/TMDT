package com.example.dacsanmientrung_backend.service;

import com.example.dacsanmientrung_backend.dto.request.AddComboItemRequest;
import com.example.dacsanmientrung_backend.dto.request.CreateComboRequest;
import com.example.dacsanmientrung_backend.dto.request.UpdateComboItemRequest;
import com.example.dacsanmientrung_backend.dto.request.UpdateComboRequest;
import com.example.dacsanmientrung_backend.dto.response.ComboDetailResponse;
import com.example.dacsanmientrung_backend.dto.response.ComboResponse;

import java.util.List;

public interface ComboService {

    ComboDetailResponse createCombo(CreateComboRequest request);

    List<ComboResponse> getCombosByUser(Integer maNguoiDung, String status);

    ComboDetailResponse getComboById(Integer maCombo);

    ComboDetailResponse updateCombo(Integer maCombo, UpdateComboRequest request);

    ComboDetailResponse addItem(Integer maCombo, AddComboItemRequest request);

    ComboDetailResponse updateItem(Integer maChiTietCombo, UpdateComboItemRequest request);

    ComboDetailResponse deleteItem(Integer maChiTietCombo);

    ComboDetailResponse cancelCombo(Integer maCombo);

    ComboDetailResponse markOrdered(Integer maCombo);

    List<ComboResponse> getAllCombos(String status, String keyword);
}
