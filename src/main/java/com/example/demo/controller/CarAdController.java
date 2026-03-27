package com.example.demo.controller;

import com.example.demo.dto.CarAdRequest;
import com.example.demo.dto.CarAdResponse;
import com.example.demo.dto.MessageResponse;
import com.example.demo.model.CarAd;
import com.example.demo.model.User;
import com.example.demo.repository.CarAdRepository;
import com.example.demo.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/ads")
public class CarAdController {

    private final CarAdRepository carAdRepository;
    private final UserRepository userRepository;

    public CarAdController(CarAdRepository carAdRepository, UserRepository userRepository) {
        this.carAdRepository = carAdRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<CarAdResponse> getAllAds() {
        return carAdRepository.findAllByOrderByIdDesc()
                .stream()
                .map(CarAdResponse::fromEntity)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAdById(@PathVariable Long id) {
        CarAd carAd = carAdRepository.findById(id).orElse(null);

        if (carAd == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Anunțul nu a fost găsit"));
        }

        return ResponseEntity.ok(CarAdResponse.fromEntity(carAd));
    }

    @PostMapping
    public ResponseEntity<CarAdResponse> createAd(@Valid @RequestBody CarAdRequest request,
                                                  Authentication authentication) {
        User currentUser = getCurrentUser(authentication);

        CarAd carAd = new CarAd();
        carAd.setTitlu(request.getTitlu().trim());
        carAd.setDescriere(request.getDescriere().trim());
        carAd.setPret(request.getPret());
        carAd.setNrTelefon(request.getNrTelefon().trim());

        String imagineUrl = request.getImagineUrl();
        if (imagineUrl != null && !imagineUrl.isBlank()) {
            carAd.setImagineUrl(imagineUrl.trim());
        }

        carAd.setOwner(currentUser);

        CarAd savedAd = carAdRepository.save(carAd);
        return ResponseEntity.status(HttpStatus.CREATED).body(CarAdResponse.fromEntity(savedAd));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAd(@PathVariable Long id,
                                      @Valid @RequestBody CarAdRequest request,
                                      Authentication authentication) {
        User currentUser = getCurrentUser(authentication);

        CarAd carAd = carAdRepository.findById(id).orElse(null);
        if (carAd == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Anunțul nu a fost găsit"));
        }

        if (!carAd.getOwner().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("Poți modifica doar propriile anunțuri"));
        }

        carAd.setTitlu(request.getTitlu().trim());
        carAd.setDescriere(request.getDescriere().trim());
        carAd.setPret(request.getPret());
        carAd.setNrTelefon(request.getNrTelefon().trim());

        String imagineUrl = request.getImagineUrl();
        if (imagineUrl == null || imagineUrl.isBlank()) {
            carAd.setImagineUrl(null);
        } else {
            carAd.setImagineUrl(imagineUrl.trim());
        }

        CarAd savedAd = carAdRepository.save(carAd);
        return ResponseEntity.ok(CarAdResponse.fromEntity(savedAd));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteAd(@PathVariable Long id, Authentication authentication) {
        User currentUser = getCurrentUser(authentication);

        CarAd carAd = carAdRepository.findById(id)
                .orElse(null);

        if (carAd == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Anunțul nu a fost găsit"));
        }

        if (!carAd.getOwner().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("Poți șterge doar propriile anunțuri"));
        }

        carAdRepository.delete(carAd);
        return ResponseEntity.ok(new MessageResponse("Anunț șters cu succes"));
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new UsernameNotFoundException("Utilizator neautentificat");
        }

        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Utilizatorul nu există"));
    }
}
