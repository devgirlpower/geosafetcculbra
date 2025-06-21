package com.geosafe.geosafe.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "areas_alagadas")
public class AreaAlagada {
    @Id
    private String id;
    private List<List<Double>> coordinates;
    private Boolean flooded = false;
}
