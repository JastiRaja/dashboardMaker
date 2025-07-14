package com.dashboard.generator.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Entity
@Table(name = "chart_configs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChartConfig {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String configId; // UUID for frontend reference
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChartType type;
    
    @Column(nullable = false)
    private String title;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dataset_id", nullable = false)
    private Dataset dataset;
    
    @Column(name = "x_axis")
    private String xAxis;
    
    @Column(name = "y_axis")
    private String yAxis;
    
    @Column(columnDefinition = "TEXT")
    private String settings; // JSON string of chart settings
    
    public enum ChartType {
        BAR, PIE, LINE, TABLE
    }
} 