package com.geosafe.geosafe.controller;

import com.geosafe.geosafe.model.Shelter;
import com.geosafe.geosafe.repository.ShelterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Metrics;
import org.springframework.data.geo.Point;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/shelters")
@CrossOrigin(origins = "*")
public class ShelterController {
    @Autowired
    private ShelterRepository repository;

    @GetMapping
    public List<Shelter> getAll() {
        return repository.findAll();
    }

    @GetMapping("/nearby")
    public List<Shelter> getNearby(@RequestParam double lat, @RequestParam double lng, @RequestParam(defaultValue = "5") double radiusKm) {
        Point point = new Point(lng, lat);
        Distance radius = new Distance(radiusKm, Metrics.KILOMETERS);
        return repository.findByLocationNear(point, radius);
    }

    @PostMapping
    public Shelter create(@RequestBody Shelter shelter) {
        return repository.save(shelter);
    }
}
