package com.example.dacsanmientrung_backend.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public String health() {
        return "Backend DacSanMienTrung is running";
    }

    @GetMapping("/db")
    public String databaseHealth() {
        jdbcTemplate.queryForObject("SELECT 1", Integer.class);
        return "Database connected";
    }
}
