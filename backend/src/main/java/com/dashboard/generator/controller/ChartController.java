package com.dashboard.generator.controller;

import com.dashboard.generator.dto.common.ApiResponse;
import com.dashboard.generator.service.DatasetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/charts")
public class ChartController {

    @Autowired
    private DatasetService datasetService;

    @PostMapping("/data")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getChartData(@RequestBody ChartDataRequest request) {
        try {
            System.out.println("[ChartController] Incoming request: " + request);
            List<Map<String, Object>> data = datasetService.getChartData(
                request.getDatasetId(),
                request.getXAxis(),
                request.getYAxis(),
                request.getAggregation(),
                request.getGroupBy(),
                request.getFilters()
            );
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @PostMapping("/test")
    public ResponseEntity<String> test(@RequestBody Map<String, Object> body) {
        System.out.println("[ChartController] Test endpoint hit: " + body);
        return ResponseEntity.ok("OK");
    }

    public static class ChartDataRequest {
        private Long datasetId;
        private String xAxis;
        private String yAxis;
        private String aggregation;
        private List<String> groupBy;
        private List<Filter> filters;
        // getters and setters
        public Long getDatasetId() { return datasetId; }
        public void setDatasetId(Long datasetId) { this.datasetId = datasetId; }
        public String getXAxis() { return xAxis; }
        public void setXAxis(String xAxis) { this.xAxis = xAxis; }
        public String getYAxis() { return yAxis; }
        public void setYAxis(String yAxis) { this.yAxis = yAxis; }
        public String getAggregation() { return aggregation; }
        public void setAggregation(String aggregation) { this.aggregation = aggregation; }
        public List<String> getGroupBy() { return groupBy; }
        public void setGroupBy(List<String> groupBy) { this.groupBy = groupBy; }
        public List<Filter> getFilters() { return filters; }
        public void setFilters(List<Filter> filters) { this.filters = filters; }
    }
    public static class Filter {
        private String column;
        private String operator;
        private String value;
        // getters and setters
        public String getColumn() { return column; }
        public void setColumn(String column) { this.column = column; }
        public String getOperator() { return operator; }
        public void setOperator(String operator) { this.operator = operator; }
        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }
    }
} 