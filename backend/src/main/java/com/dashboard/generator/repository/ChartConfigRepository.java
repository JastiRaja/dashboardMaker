package com.dashboard.generator.repository;

import com.dashboard.generator.entity.ChartConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChartConfigRepository extends JpaRepository<ChartConfig, Long> {
    
    Optional<ChartConfig> findByConfigId(String configId);
} 