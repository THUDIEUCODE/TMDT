package com.example.dacsanmientrung_backend.controller;

import com.example.dacsanmientrung_backend.dto.response.AdminDashboardResponse;
import com.example.dacsanmientrung_backend.dto.response.StaffDashboardResponse;
import com.example.dacsanmientrung_backend.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/staff")
    public StaffDashboardResponse getStaffDashboard() {
        return dashboardService.getStaffDashboard();
    }

    @GetMapping("/admin")
    public AdminDashboardResponse getAdminDashboard() {
        return dashboardService.getAdminDashboard();
    }
}
