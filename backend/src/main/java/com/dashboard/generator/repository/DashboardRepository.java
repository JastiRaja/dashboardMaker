package com.dashboard.generator.repository;

import com.dashboard.generator.entity.Dashboard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DashboardRepository extends JpaRepository<Dashboard, Long> {
    
    List<Dashboard> findByUserIdOrderByUpdatedAtDesc(Long userId);
    
    Optional<Dashboard> findByPublicId(String publicId);
    
    boolean existsByNameAndUserId(String name, Long userId);
} 