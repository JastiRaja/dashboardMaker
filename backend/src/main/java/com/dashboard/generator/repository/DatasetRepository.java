package com.dashboard.generator.repository;

import com.dashboard.generator.entity.Dataset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DatasetRepository extends JpaRepository<Dataset, Long> {
    
    List<Dataset> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    boolean existsByNameAndUserId(String name, Long userId);
} 