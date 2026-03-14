package com.smartcampus.hub.repository;

import com.smartcampus.hub.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long>, JpaSpecificationExecutor<Resource> {
    // Basic finder methods; more complex filtering will use
    // JpaSpecificationExecutor
    List<Resource> findByType(Resource.ResourceType type);

    List<Resource> findByStatus(Resource.ResourceStatus status);
}
