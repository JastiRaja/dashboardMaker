package com.dashboard.generator.dto.dashboard;

import com.dashboard.generator.entity.ChartConfig;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class ChartConfigDto {
    
    private String id;
    private ChartConfig.ChartType type;
    private String title;
    private Long datasetId;
    private String xAxis;
    private String yAxis;
    private Map<String, Object> settings;
} 