package com.example.dacsanmientrung_backend.service;

import com.example.dacsanmientrung_backend.dto.response.AdminDashboardResponse;
import com.example.dacsanmientrung_backend.dto.response.StaffDashboardResponse;

public interface DashboardService {

    StaffDashboardResponse getStaffDashboard();

    AdminDashboardResponse getAdminDashboard();
}
