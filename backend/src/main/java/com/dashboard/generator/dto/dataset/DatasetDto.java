package com.dashboard.generator.dto.dataset;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class DatasetDto {
    
    private Long id;
    private String name;
    private List<String> columns;
    private List<Map<String, Object>> data;
    private Long userId;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
} 