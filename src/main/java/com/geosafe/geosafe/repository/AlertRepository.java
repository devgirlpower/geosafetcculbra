package com.geosafe.geosafe.repository;

import com.geosafe.geosafe.model.Alert;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AlertRepository extends MongoRepository<Alert, String> {
}