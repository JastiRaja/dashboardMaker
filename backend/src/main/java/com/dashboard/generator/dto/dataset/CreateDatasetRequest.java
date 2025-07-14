package com.dashboard.generator.dto.dataset;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class CreateDatasetRequest {
    
    @NotBlank(message = "Dataset name is required")
    private String name;
    
    @NotEmpty(message = "Dataset data is required")
    private List<Map<String, Object>> data;
} 