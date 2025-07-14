package com.dashboard.generator.dto.dashboard;

import lombok.Data;

@Data
public class DashboardWidgetDto {
    
    private String i; // Widget ID
    private Integer x;
    private Integer y;
    private Integer w;
    private Integer h;
    private ChartConfigDto chartConfig;
} 