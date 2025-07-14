package com.dashboard.generator.service;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.util.*;

@Slf4j
@Service
public class FileParsingService {
    
    public List<Map<String, Object>> parseCsvFile(MultipartFile file) throws IOException, CsvException {
        List<Map<String, Object>> data = new ArrayList<>();
        
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            List<String[]> rows = reader.readAll();
            
            if (rows.isEmpty()) {
                throw new IllegalArgumentException("CSV file is empty");
            }
            
            String[] headers = rows.get(0);
            
            for (int i = 1; i < rows.size(); i++) {
                String[] row = rows.get(i);
                Map<String, Object> rowData = new HashMap<>();
                
                for (int j = 0; j < headers.length; j++) {
                    String value = j < row.length ? row[j] : "";
                    rowData.put(headers[j], parseValue(value));
                }
                
                data.add(rowData);
            }
        }
        
        return data;
    }
    
    public List<Map<String, Object>> parseExcelFile(MultipartFile file) throws IOException {
        List<Map<String, Object>> data = new ArrayList<>();
        
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            
            if (sheet.getPhysicalNumberOfRows() == 0) {
                throw new IllegalArgumentException("Excel file is empty");
            }
            
            Row headerRow = sheet.getRow(0);
            List<String> headers = new ArrayList<>();
            
            for (int i = 0; i < headerRow.getLastCellNum(); i++) {
                Cell cell = headerRow.getCell(i);
                String header = (cell != null ? cell.toString().trim() : "Column" + (i + 1));
                headers.add(header);
            }
            System.out.println("Headers: " + headers);
            System.out.println("Total rows: " + sheet.getLastRowNum());
            
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                Map<String, Object> rowData = new HashMap<>();
                
                for (int j = 0; j < headers.size(); j++) {
                    Cell cell = row.getCell(j);
                    String value = getCellValueAsString(cell);
                    rowData.put(headers.get(j), parseValue(value));
                }
                
                data.add(rowData);
            }
        }
        
        return data;
    }
    
    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return "";
        }
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    double numericValue = cell.getNumericCellValue();
                    if (numericValue == (long) numericValue) {
                        return String.valueOf((long) numericValue);
                    } else {
                        return String.valueOf(numericValue);
                    }
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return "";
        }
    }
    
    private Object parseValue(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        
        value = value.trim();
        
        // Try to parse as number
        try {
            if (value.contains(".")) {
                return Double.parseDouble(value);
            } else {
                return Long.parseLong(value);
            }
        } catch (NumberFormatException e) {
            // If not a number, return as string
            return value;
        }
    }
} 