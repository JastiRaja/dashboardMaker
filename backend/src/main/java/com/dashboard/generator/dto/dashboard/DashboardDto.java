package com.dashboard.generator.dto.dashboard;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class DashboardDto {
    
    private Long id;
    private String name;
    private String description;
    private List<DashboardWidgetDto> widgets;
    private Long userId;
    private boolean isPublic;
    private String publicId;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
} 