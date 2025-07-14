package com.dashboard.generator.controller;

import com.dashboard.generator.dto.common.ApiResponse;
import com.dashboard.generator.dto.dashboard.DashboardDto;
import com.dashboard.generator.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboards")
public class DashboardController {
    
    @Autowired
    private DashboardService dashboardService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<DashboardDto>>> getAllDashboards() {
        try {
            String username = getCurrentUsername();
            List<DashboardDto> dashboards = dashboardService.getAllDashboardsByUser(username);
            return ResponseEntity.ok(ApiResponse.success(dashboards));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DashboardDto>> getDashboardById(@PathVariable Long id) {
        try {
            String username = getCurrentUsername();
            DashboardDto dashboard = dashboardService.getDashboardById(id, username);
            return ResponseEntity.ok(ApiResponse.success(dashboard));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/public/{publicId}")
    public ResponseEntity<ApiResponse<DashboardDto>> getPublicDashboard(@PathVariable String publicId) {
        try {
            DashboardDto dashboard = dashboardService.getPublicDashboard(publicId);
            return ResponseEntity.ok(ApiResponse.success(dashboard));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<DashboardDto>> createDashboard(@RequestBody DashboardDto dashboardDto) {
        try {
            String username = getCurrentUsername();
            DashboardDto dashboard = dashboardService.createDashboard(dashboardDto, username);
            return ResponseEntity.ok(ApiResponse.success(dashboard, "Dashboard created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DashboardDto>> updateDashboard(@PathVariable Long id, @RequestBody DashboardDto dashboardDto) {
        try {
            String username = getCurrentUsername();
            DashboardDto dashboard = dashboardService.updateDashboard(id, dashboardDto, username);
            return ResponseEntity.ok(ApiResponse.success(dashboard, "Dashboard updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteDashboard(@PathVariable Long id) {
        try {
            String username = getCurrentUsername();
            dashboardService.deleteDashboard(id, username);
            return ResponseEntity.ok(ApiResponse.success("Dashboard deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/share")
    public ResponseEntity<ApiResponse<Map<String, String>>> shareDashboard(@PathVariable Long id) {
        try {
            String username = getCurrentUsername();
            Map<String, String> result = dashboardService.shareDashboard(id, username);
            return ResponseEntity.ok(ApiResponse.success(result, "Dashboard shared successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/unshare")
    public ResponseEntity<ApiResponse<String>> unshareDashboard(@PathVariable Long id) {
        try {
            String username = getCurrentUsername();
            dashboardService.unshareDashboard(id, username);
            return ResponseEntity.ok(ApiResponse.success("Dashboard unshared successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        throw new RuntimeException("User not authenticated");
    }
} 