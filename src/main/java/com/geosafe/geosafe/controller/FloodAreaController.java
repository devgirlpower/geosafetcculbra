package com.geosafe.geosafe.controller;

import com.geosafe.geosafe.model.FloodArea;
import com.geosafe.geosafe.repository.FloodAreaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/flood-areas")
@CrossOrigin(origins = "*")
public class FloodAreaController {
    @Autowired
    private FloodAreaRepository repository;

    @GetMapping
    public List<FloodArea> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public FloodArea save(@RequestBody FloodArea area) {
        return repository.save(area);
    }
}
