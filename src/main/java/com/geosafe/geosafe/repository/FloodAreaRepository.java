package com.geosafe.geosafe.repository;

import com.geosafe.geosafe.model.FloodArea;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FloodAreaRepository extends MongoRepository<FloodArea, String> {
}