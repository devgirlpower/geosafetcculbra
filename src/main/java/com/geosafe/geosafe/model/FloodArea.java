package com.geosafe.geosafe.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.geo.GeoJsonPolygon;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "flood_areas")
@Data
public class FloodArea {
    @Id
    private String id;
    private String description;
    private GeoJsonPolygon area;
}
