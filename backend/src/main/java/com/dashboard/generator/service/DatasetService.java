package com.dashboard.generator.service;

import com.dashboard.generator.dto.dataset.CreateDatasetRequest;
import com.dashboard.generator.dto.dataset.DatasetDto;
import com.dashboard.generator.entity.Dataset;
import com.dashboard.generator.entity.User;
import com.dashboard.generator.repository.DatasetRepository;
import com.dashboard.generator.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.opencsv.exceptions.CsvException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.dashboard.generator.controller.ChartController;

@Slf4j
@Service
public class DatasetService {
    
    @Autowired
    private DatasetRepository datasetRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FileParsingService fileParsingService;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    public List<DatasetDto> getAllDatasetsByUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        return datasetRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public DatasetDto getDatasetById(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        Dataset dataset = datasetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dataset not found"));
        
        if (!dataset.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }
        
        return convertToDto(dataset);
    }
    
    public DatasetDto createDataset(CreateDatasetRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        if (datasetRepository.existsByNameAndUserId(request.getName(), user.getId())) {
            throw new RuntimeException("Dataset with this name already exists");
        }
        
        Dataset dataset = new Dataset();
        dataset.setName(request.getName());
        dataset.setUser(user);
        
        // Extract columns from the first data row
        if (!request.getData().isEmpty()) {
            List<String> columns = request.getData().get(0).keySet().stream()
                    .collect(Collectors.toList());
            dataset.setColumns(columns);
        }
        
        // Convert data to JSON string
        try {
            dataset.setData(objectMapper.writeValueAsString(request.getData()));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing data", e);
        }
        
        Dataset savedDataset = datasetRepository.saveAndFlush(dataset);
        return convertToDto(savedDataset);
    }
    
    public DatasetDto uploadFile(MultipartFile file, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            throw new RuntimeException("Invalid file name");
        }
        
        List<Map<String, Object>> data;
        
        try {
            if (fileName.toLowerCase().endsWith(".csv")) {
                data = fileParsingService.parseCsvFile(file);
            } else if (fileName.toLowerCase().endsWith(".xlsx") || fileName.toLowerCase().endsWith(".xls")) {
                data = fileParsingService.parseExcelFile(file);
            } else {
                throw new RuntimeException("Unsupported file format. Please upload CSV or Excel files.");
            }
        } catch (IOException | CsvException e) {
            throw new RuntimeException("Error parsing file: " + e.getMessage(), e);
        }
        
        if (data.isEmpty()) {
            throw new RuntimeException("No data found in file");
        }
        
        // Generate dataset name from filename
        String datasetName = fileName.substring(0, fileName.lastIndexOf('.'));
        
        // Check if dataset name already exists
        int counter = 1;
        String originalName = datasetName;
        while (datasetRepository.existsByNameAndUserId(datasetName, user.getId())) {
            datasetName = originalName + " (" + counter + ")";
            counter++;
        }
        
        Dataset dataset = new Dataset();
        dataset.setName(datasetName);
        dataset.setUser(user);
        
        // Extract columns from the first data row
        List<String> columns = data.get(0).keySet().stream()
                .collect(Collectors.toList());
        dataset.setColumns(columns);
        
        // Convert data to JSON string
        try {
            dataset.setData(objectMapper.writeValueAsString(data));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing data", e);
        }
        
        Dataset savedDataset = datasetRepository.saveAndFlush(dataset);
        return convertToDto(savedDataset);
    }
    
    public void deleteDataset(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        Dataset dataset = datasetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dataset not found"));
        
        if (!dataset.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }
        
        datasetRepository.delete(dataset);
    }
    
    public List<Map<String, Object>> getChartData(Long datasetId, String xAxis, String yAxis, String aggregation, List<String> groupBy, List<ChartController.Filter> filters) {
        Dataset dataset = datasetRepository.findById(datasetId)
                .orElseThrow(() -> new RuntimeException("Dataset not found"));
        List<Map<String, Object>> data;
        try {
            data = objectMapper.readValue(dataset.getData(), List.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error parsing dataset data", e);
        }
        if (!data.isEmpty()) {
            System.out.println("[DatasetService] First row of dataset: " + data.get(0));
        } else {
            System.out.println("[DatasetService] Dataset is empty");
        }
        // Filter out empty filters
        final List<ChartController.Filter> filteredFilters = filters != null ? 
            filters.stream()
                .filter(f -> f.getColumn() != null && !f.getColumn().isEmpty())
                .collect(java.util.stream.Collectors.toList()) : 
            new java.util.ArrayList<>();
        
        // 1. Apply filters
        if (!filteredFilters.isEmpty()) {
            data = data.stream().filter(row -> {
                for (ChartController.Filter filter : filteredFilters) {
                    Object val = row.get(filter.getColumn());
                    String op = filter.getOperator();
                    String fval = filter.getValue();
                    if (val == null) return false;
                    String sval = val.toString();
                    switch (op) {
                        case "eq": if (!sval.equals(fval)) return false; break;
                        case "neq": if (sval.equals(fval)) return false; break;
                        case "gt": try { if (Double.parseDouble(sval) <= Double.parseDouble(fval)) return false; } catch (Exception e) { return false; } break;
                        case "lt": try { if (Double.parseDouble(sval) >= Double.parseDouble(fval)) return false; } catch (Exception e) { return false; } break;
                        case "gte": try { if (Double.parseDouble(sval) < Double.parseDouble(fval)) return false; } catch (Exception e) { return false; } break;
                        case "lte": try { if (Double.parseDouble(sval) > Double.parseDouble(fval)) return false; } catch (Exception e) { return false; } break;
                        case "contains": if (!sval.contains(fval)) return false; break;
                    }
                }
                return true;
            }).toList();
        }
        // 2. Grouping and aggregation
        if (groupBy != null && !groupBy.isEmpty() && yAxis != null && !yAxis.isEmpty()) {
            // Group by groupBy columns
            Map<String, Map<String, Object>> grouped = new java.util.LinkedHashMap<>();
            for (Map<String, Object> row : data) {
                String key = groupBy.stream().map(g -> String.valueOf(row.get(g))).reduce((a, b) -> a + "|" + b).orElse("");
                if (!grouped.containsKey(key)) {
                    Map<String, Object> newRow = new java.util.HashMap<>();
                    for (String g : groupBy) newRow.put(g, row.get(g));
                    newRow.put(yAxis + "_count", 0);
                    newRow.put(yAxis + "_sum", 0.0);
                    newRow.put(yAxis + "_min", Double.MAX_VALUE);
                    newRow.put(yAxis + "_max", -Double.MAX_VALUE);
                    newRow.put(yAxis + "_values", new java.util.ArrayList<Double>());
                    grouped.put(key, newRow);
                }
                Map<String, Object> aggRow = grouped.get(key);
                double yVal = 0.0;
                try { yVal = Double.parseDouble(String.valueOf(row.get(yAxis))); } catch (Exception e) { }
                aggRow.put(yAxis + "_count", (int)aggRow.get(yAxis + "_count") + 1);
                aggRow.put(yAxis + "_sum", (double)aggRow.get(yAxis + "_sum") + yVal);
                aggRow.put(yAxis + "_min", Math.min((double)aggRow.get(yAxis + "_min"), yVal));
                aggRow.put(yAxis + "_max", Math.max((double)aggRow.get(yAxis + "_max"), yVal));
                ((java.util.List<Double>)aggRow.get(yAxis + "_values")).add(yVal);
            }
            // Build result rows
            List<Map<String, Object>> result = new java.util.ArrayList<>();
            for (Map<String, Object> row : grouped.values()) {
                double sum = (double)row.get(yAxis + "_sum");
                int count = (int)row.get(yAxis + "_count");
                double min = (double)row.get(yAxis + "_min");
                double max = (double)row.get(yAxis + "_max");
                double avg = count > 0 ? sum / count : 0.0;
                Object yValue = switch (aggregation) {
                    case "count" -> count;
                    case "sum" -> sum;
                    case "avg" -> avg;
                    case "min" -> min == Double.MAX_VALUE ? null : min;
                    case "max" -> max == -Double.MAX_VALUE ? null : max;
                    default -> sum;
                };
                Map<String, Object> out = new java.util.HashMap<>();
                for (String g : groupBy) out.put(g, row.get(g));
                out.put(yAxis, yValue);
                result.add(out);
            }
            return result;
        }
        // 3. No grouping, just aggregation or raw data
        if (aggregation != null && !aggregation.equals("none") && yAxis != null && !yAxis.isEmpty()) {
            double sum = 0.0, min = Double.MAX_VALUE, max = -Double.MAX_VALUE;
            int count = 0;
            for (Map<String, Object> row : data) {
                double yVal = 0.0;
                try { yVal = Double.parseDouble(String.valueOf(row.get(yAxis))); } catch (Exception e) { }
                sum += yVal;
                min = Math.min(min, yVal);
                max = Math.max(max, yVal);
                count++;
            }
            double avg = count > 0 ? sum / count : 0.0;
            Object yValue = switch (aggregation) {
                case "count" -> count;
                case "sum" -> sum;
                case "avg" -> avg;
                case "min" -> min == Double.MAX_VALUE ? null : min;
                case "max" -> max == -Double.MAX_VALUE ? null : max;
                default -> sum;
            };
            Map<String, Object> out = new java.util.HashMap<>();
            out.put(yAxis, yValue);
            return java.util.List.of(out);
        }
        // 4. No aggregation/grouping, return filtered data
        return data;
    }
    
    private DatasetDto convertToDto(Dataset dataset) {
        DatasetDto dto = new DatasetDto();
        dto.setId(dataset.getId());
        dto.setName(dataset.getName());
        dto.setColumns(dataset.getColumns());
        dto.setUserId(dataset.getUser().getId());
        dto.setCreatedAt(dataset.getCreatedAt());
        
        // Parse JSON data back to List<Map<String, Object>>
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> data = objectMapper.readValue(dataset.getData(), List.class);
            dto.setData(data);
        } catch (JsonProcessingException e) {
            log.error("Error parsing dataset data", e);
            dto.setData(List.of());
        }
        
        return dto;
    }
} 