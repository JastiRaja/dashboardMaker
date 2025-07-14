package com.dashboard.generator.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "dashboard_widgets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardWidget {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "widget_id", nullable = false)
    private String widgetId; // Frontend widget ID (i)
    
    @Column(nullable = false)
    private Integer x; // X position
    
    @Column(nullable = false)
    private Integer y; // Y position
    
    @Column(nullable = false)
    private Integer w; // Width
    
    @Column(nullable = false)
    private Integer h; // Height
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dashboard_id", nullable = false)
    private Dashboard dashboard;
    
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "chart_config_id", nullable = false)
    private ChartConfig chartConfig;
} 