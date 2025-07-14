package com.dashboard.generator.controller;

import com.dashboard.generator.dto.common.ApiResponse;
import com.dashboard.generator.dto.dataset.CreateDatasetRequest;
import com.dashboard.generator.dto.dataset.DatasetDto;
import com.dashboard.generator.service.DatasetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/datasets")
public class DatasetController {
    
    @Autowired
    private DatasetService datasetService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<DatasetDto>>> getAllDatasets() {
        try {
            String username = getCurrentUsername();
            List<DatasetDto> datasets = datasetService.getAllDatasetsByUser(username);
            return ResponseEntity.ok(ApiResponse.success(datasets));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DatasetDto>> getDatasetById(@PathVariable Long id) {
        try {
            String username = getCurrentUsername();
            DatasetDto dataset = datasetService.getDatasetById(id, username);
            return ResponseEntity.ok(ApiResponse.success(dataset));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<DatasetDto>> createDataset(@Valid @RequestBody CreateDatasetRequest request) {
        try {
            String username = getCurrentUsername();
            DatasetDto dataset = datasetService.createDataset(request, username);
            return ResponseEntity.ok(ApiResponse.success(dataset, "Dataset created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<DatasetDto>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String username = getCurrentUsername();
            DatasetDto dataset = datasetService.uploadFile(file, username);
            return ResponseEntity.ok(ApiResponse.success(dataset, "File uploaded successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteDataset(@PathVariable Long id) {
        try {
            String username = getCurrentUsername();
            datasetService.deleteDataset(id, username);
            return ResponseEntity.ok(ApiResponse.success("Dataset deleted successfully"));
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