package com.dashboard.generator.service;

import com.dashboard.generator.dto.dashboard.DashboardDto;
import com.dashboard.generator.dto.dashboard.DashboardWidgetDto;
import com.dashboard.generator.entity.*;
import com.dashboard.generator.repository.ChartConfigRepository;
import com.dashboard.generator.repository.DashboardRepository;
import com.dashboard.generator.repository.DatasetRepository;
import com.dashboard.generator.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class DashboardService {
    
    @Autowired
    private DashboardRepository dashboardRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private DatasetRepository datasetRepository;
    
    @Autowired
    private ChartConfigRepository chartConfigRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    public List<DashboardDto> getAllDashboardsByUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        return dashboardRepository.findByUserIdOrderByUpdatedAtDesc(user.getId())
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public DashboardDto getDashboardById(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        Dashboard dashboard = dashboardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dashboard not found"));
        
        if (!dashboard.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }
        
        return convertToDto(dashboard);
    }
    
    public DashboardDto getPublicDashboard(String publicId) {
        Dashboard dashboard = dashboardRepository.findByPublicId(publicId)
                .orElseThrow(() -> new RuntimeException("Dashboard not found"));
        
        if (!dashboard.isPublic()) {
            throw new RuntimeException("Dashboard is not public");
        }
        
        return convertToDto(dashboard);
    }
    
    @Transactional
    public DashboardDto createDashboard(DashboardDto dashboardDto, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        if (dashboardRepository.existsByNameAndUserId(dashboardDto.getName(), user.getId())) {
            throw new RuntimeException("Dashboard with this name already exists");
        }
        
        Dashboard dashboard = new Dashboard();
        dashboard.setName(dashboardDto.getName());
        dashboard.setDescription(dashboardDto.getDescription());
        dashboard.setUser(user);
        dashboard.setPublic(dashboardDto.isPublic());
        
        Dashboard savedDashboard = dashboardRepository.save(dashboard);
        
        // Save widgets and chart configs
        if (dashboardDto.getWidgets() != null) {
            List<DashboardWidget> widgets = dashboardDto.getWidgets().stream()
                    .map(widgetDto -> createWidget(widgetDto, savedDashboard))
                    .collect(Collectors.toList());
            savedDashboard.setWidgets(widgets);
        }
        
        return convertToDto(savedDashboard);
    }
    
    @Transactional
    public DashboardDto updateDashboard(Long id, DashboardDto dashboardDto, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        Dashboard dashboard = dashboardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dashboard not found"));
        
        if (!dashboard.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }
        
        dashboard.setName(dashboardDto.getName());
        dashboard.setDescription(dashboardDto.getDescription());
        dashboard.setPublic(dashboardDto.isPublic());
        
        // Clear existing widgets and create new ones
        dashboard.getWidgets().clear();
        if (dashboardDto.getWidgets() != null) {
            List<DashboardWidget> widgets = dashboardDto.getWidgets().stream()
                    .map(widgetDto -> createWidget(widgetDto, dashboard))
                    .collect(Collectors.toList());
            dashboard.setWidgets(widgets);
        }
        
        Dashboard savedDashboard = dashboardRepository.save(dashboard);
        return convertToDto(savedDashboard);
    }
    
    public void deleteDashboard(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        Dashboard dashboard = dashboardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dashboard not found"));
        
        if (!dashboard.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }
        
        dashboardRepository.delete(dashboard);
    }
    
    public Map<String, String> shareDashboard(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        Dashboard dashboard = dashboardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dashboard not found"));
        
        if (!dashboard.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }
        
        String publicId = UUID.randomUUID().toString();
        dashboard.setPublic(true);
        dashboard.setPublicId(publicId);
        
        dashboardRepository.save(dashboard);
        
        return Map.of("publicId", publicId);
    }
    
    public void unshareDashboard(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        Dashboard dashboard = dashboardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dashboard not found"));
        
        if (!dashboard.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }
        
        dashboard.setPublic(false);
        dashboard.setPublicId(null);
        
        dashboardRepository.save(dashboard);
    }
    
    private DashboardWidget createWidget(DashboardWidgetDto widgetDto, Dashboard dashboard) {
        // Create chart config
        ChartConfig chartConfig = new ChartConfig();
        chartConfig.setConfigId(widgetDto.getChartConfig().getId());
        chartConfig.setType(widgetDto.getChartConfig().getType());
        chartConfig.setTitle(widgetDto.getChartConfig().getTitle());
        
        Dataset dataset = datasetRepository.findById(widgetDto.getChartConfig().getDatasetId())
                .orElseThrow(() -> new RuntimeException("Dataset not found"));
        chartConfig.setDataset(dataset);
        
        chartConfig.setXAxis(widgetDto.getChartConfig().getXAxis());
        chartConfig.setYAxis(widgetDto.getChartConfig().getYAxis());
        
        // Convert settings to JSON
        try {
            chartConfig.setSettings(objectMapper.writeValueAsString(widgetDto.getChartConfig().getSettings()));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing chart settings", e);
        }
        
        ChartConfig savedChartConfig = chartConfigRepository.save(chartConfig);
        
        // Create widget
        DashboardWidget widget = new DashboardWidget();
        widget.setWidgetId(widgetDto.getI());
        widget.setX(widgetDto.getX());
        widget.setY(widgetDto.getY());
        widget.setW(widgetDto.getW());
        widget.setH(widgetDto.getH());
        widget.setDashboard(dashboard);
        widget.setChartConfig(savedChartConfig);
        
        return widget;
    }
    
    private DashboardDto convertToDto(Dashboard dashboard) {
        DashboardDto dto = new DashboardDto();
        dto.setId(dashboard.getId());
        dto.setName(dashboard.getName());
        dto.setDescription(dashboard.getDescription());
        dto.setUserId(dashboard.getUser().getId());
        dto.setPublic(dashboard.isPublic());
        dto.setPublicId(dashboard.getPublicId());
        dto.setCreatedAt(dashboard.getCreatedAt());
        dto.setUpdatedAt(dashboard.getUpdatedAt());
        
        if (dashboard.getWidgets() != null) {
            List<DashboardWidgetDto> widgetDtos = dashboard.getWidgets().stream()
                    .map(this::convertWidgetToDto)
                    .collect(Collectors.toList());
            dto.setWidgets(widgetDtos);
        }
        
        return dto;
    }
    
    private DashboardWidgetDto convertWidgetToDto(DashboardWidget widget) {
        DashboardWidgetDto dto = new DashboardWidgetDto();
        dto.setI(widget.getWidgetId());
        dto.setX(widget.getX());
        dto.setY(widget.getY());
        dto.setW(widget.getW());
        dto.setH(widget.getH());
        dto.setChartConfig(convertChartConfigToDto(widget.getChartConfig()));
        return dto;
    }
    
    private com.dashboard.generator.dto.dashboard.ChartConfigDto convertChartConfigToDto(ChartConfig chartConfig) {
        com.dashboard.generator.dto.dashboard.ChartConfigDto dto = new com.dashboard.generator.dto.dashboard.ChartConfigDto();
        dto.setId(chartConfig.getConfigId());
        dto.setType(chartConfig.getType());
        dto.setTitle(chartConfig.getTitle());
        dto.setDatasetId(chartConfig.getDataset().getId());
        dto.setXAxis(chartConfig.getXAxis());
        dto.setYAxis(chartConfig.getYAxis());
        
        // Parse settings JSON
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> settings = objectMapper.readValue(chartConfig.getSettings(), Map.class);
            dto.setSettings(settings);
        } catch (JsonProcessingException e) {
            log.error("Error parsing chart settings", e);
            dto.setSettings(Map.of());
        }
        
        return dto;
    }
} 