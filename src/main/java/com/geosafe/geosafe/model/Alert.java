package com.geosafe.geosafe.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "alerts")
@Data
public class Alert {
    @Id
    private String id;
    private String message;
    private String level;
    private long timestamp;
}
