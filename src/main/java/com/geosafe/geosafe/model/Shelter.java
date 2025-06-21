package com.geosafe.geosafe.model;

import jakarta.persistence.Id;
import lombok.Data;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "shelters")
public class Shelter {
    @Id
    private String id;
    private String name;
    private String address;
    private String status;

    @GeoSpatialIndexed(type = org.springframework.data.mongodb.core.index.GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint location;
}
