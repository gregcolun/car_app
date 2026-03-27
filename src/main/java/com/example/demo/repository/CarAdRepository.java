package com.example.demo.repository;

import com.example.demo.model.CarAd;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CarAdRepository extends JpaRepository<CarAd, Long> {
    List<CarAd> findAllByOrderByIdDesc();
}
