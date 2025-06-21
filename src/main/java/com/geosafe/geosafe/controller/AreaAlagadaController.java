package com.geosafe.geosafe.controller;

import com.geosafe.geosafe.model.AreaAlagada;
import com.geosafe.geosafe.repository.AreaAlagadaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/areas")
@CrossOrigin(origins = "*")
public class AreaAlagadaController {

    @Autowired
    private AreaAlagadaRepository repository;

    @PostMapping
    public AreaAlagada salvar(@RequestBody AreaAlagada area) {
        return repository.save(area);
    }

    @GetMapping
    public List<AreaAlagada> listar() {
        return repository.findAll();
    }

    @PutMapping("/{id}")
    public ResponseEntity<AreaAlagada> atualizarFlooded(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        return repository.findById(id).map(area -> {
            if (updates.containsKey("flooded")) {
                Boolean flooded = (Boolean) updates.get("flooded");
                area.setFlooded(flooded);
            }
            AreaAlagada updated = repository.save(area);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }
}
