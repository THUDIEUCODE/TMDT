package com.example.dacsanmientrung_backend.service;

import com.example.dacsanmientrung_backend.dto.response.DanhMucResponse;

import java.util.List;

public interface DanhMucService {

    List<DanhMucResponse> getAllActiveCategories();

    List<DanhMucResponse> getRootCategories();

    List<DanhMucResponse> getChildCategories(Integer parentId);

    DanhMucResponse getCategoryById(Integer id);
}
