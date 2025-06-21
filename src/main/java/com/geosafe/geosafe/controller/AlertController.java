package com.geosafe.geosafe.controller;

import com.geosafe.geosafe.model.Alert;
import com.geosafe.geosafe.repository.AlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/alerts")
@CrossOrigin(origins = "*")
public class AlertController {
    @Autowired
    private AlertRepository repository;

    @GetMapping
    public List<Alert> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Alert create(@RequestBody Alert alert) {
        alert.setTimestamp(System.currentTimeMillis());
        return repository.save(alert);
    }
}
